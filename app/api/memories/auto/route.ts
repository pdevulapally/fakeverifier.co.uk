import { NextRequest } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { callLlamaChat } from '@/lib/aiClient';

type MemoryItem = {
  content: string;
  kind?: 'profile' | 'preference' | 'fact';
  source?: string;
  score?: number;
};

type EnhancedMemoryItem = {
  content: string;
  type: 'fact' | 'preference' | 'personal' | 'work' | 'project' | 'general';
  tags: string[];
  topics: string[];
  confidence: number;
  importanceScore: number;
  relatedEntities?: string[];
};

function normalizeItems(payload: any): MemoryItem[] {
  const raw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload?.memories) ? payload.memories : [];
  return raw
    .map((m: any) => ({
      content: (m?.content || '').toString().trim(),
      kind: (m?.kind || 'fact') as any,
      source: (m?.source || 'chat').toString(),
      score: Number.isFinite(m?.score) ? Number(m.score) : 0.7,
    }))
    .filter((m: MemoryItem) => m.content && m.content.length >= 8)
    .slice(0, 10);
}

function getCookie(name: string, cookieHeader: string | null): string {
  if (!cookieHeader) return '';
  const parts = cookieHeader.split(/;\s*/);
  for (const p of parts) {
    const [k, v] = p.split('=');
    if (k === name) return decodeURIComponent(v || '');
  }
  return '';
}

export async function POST(req: NextRequest) {
  try {
    if (!db) return new Response(JSON.stringify({ error: 'Memories store not configured' }), { status: 501 });
    const body = await req.json().catch(() => ({}));
    const headerUid = (req.headers.get('x-uid') || '').toString();
    const cookieUid = getCookie('uid', req.headers.get('cookie'));
    const uid = (body?.uid || headerUid || cookieUid || '').toString();
    // Reject anonymous users - no memories for anonymous/free users
    if (!uid || uid === 'demo' || uid === '') {
      return new Response(JSON.stringify({ error: 'Memories are not available for anonymous users' }), { status: 403 });
    }

    // Mode A: direct memories payload (uid + items/memories)
    const items = normalizeItems(body);
    if (items.length) {
      const userRef = db.collection('users').doc(uid);
      const memsRef = userRef.collection('memories');
      // Load existing contents for deduplication
      const existingSnap = await memsRef.orderBy('createdAt', 'desc').limit(200).get();
      const existingMemories = existingSnap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any)
      }));
      const now = new Date();
      const batch = db.batch();
      let saved = 0;
      
      for (const m of items) {
        const norm = String(m.content || '').trim().toLowerCase();
        if (!norm || norm.length < 8) continue;
        
        // Check for exact duplicates
        const exactDuplicate = existingMemories.find(ex => 
          String(ex.content || '').trim().toLowerCase() === norm
        );
        if (exactDuplicate) continue;
        
        // Check for similar memories
        const similarMemory = await findSimilarMemories(
          {
            content: m.content,
            type: (m.kind || 'fact') as EnhancedMemoryItem['type'],
            tags: [],
            topics: [],
            confidence: Math.max(0, Math.min(1, m.score || 0.7)),
            importanceScore: 0.5,
          },
          existingMemories
        );
        
        if (similarMemory) {
          // Update existing instead of creating duplicate
          const ref = memsRef.doc(similarMemory.id);
          const existing = similarMemory.data;
          batch.update(ref, {
            confidence: Math.max(existing.confidence || 0.7, m.score || 0.7),
            updatedAt: now,
          });
        } else {
          // Create new memory with enhanced schema
          const docRef = memsRef.doc();
          batch.set(docRef, {
            content: m.content,
            type: m.kind || 'fact',
            tags: [],
            topics: [],
            importanceScore: 0.5,
            usageCount: 0,
            lastUsedAt: null,
            relatedMemories: [],
            source: m.source || 'chat',
            confidence: Math.max(0, Math.min(1, m.score || 0.7)),
            isActive: true,
            createdAt: now,
            updatedAt: now,
          });
          saved += 1;
        }
      }
      if (saved > 0) await batch.commit();
      return new Response(JSON.stringify({ ok: true, saved }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    // Mode B: analysis payload (uid + conversation + userMessage + aiResponse)
    const conversation = (body?.conversation || '').toString();
    const userMessage = (body?.userMessage || '').toString();
    const aiResponse = (body?.aiResponse || '').toString();
    if (conversation && userMessage && aiResponse) {
      // Use AI-powered extraction
      const analysis = await analyzeForMemoriesWithAI(userMessage, aiResponse, conversation);
      
      // Load existing memories for deduplication and relationship detection
      const userRef = db.collection('users').doc(uid);
      const memsRef = userRef.collection('memories');
      const existingSnap = await memsRef.orderBy('createdAt', 'desc').limit(200).get();
      const existingMemories = existingSnap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any)
      }));
      
      const createdMemories: any[] = [];
      const updatedMemories: any[] = [];
      const now = new Date();
      const processedContent = new Set<string>(); // Track processed content to prevent duplicates in same batch
      
      for (const m of analysis) {
        const norm = String(m.content || '').trim().toLowerCase();
        if (!norm || norm.length < 8) continue;
        
        // Skip if already processed in this batch
        if (processedContent.has(norm)) continue;
        processedContent.add(norm);
        
        // Check for semantic similarity with existing memories
        const similarMemory = await findSimilarMemories(m, existingMemories);
        
        if (similarMemory) {
          // Update existing memory
          const ref = memsRef.doc(similarMemory.id);
          const existing = similarMemory.data;
          
          // Merge content if complementary
          const mergedContent = mergeMemoryContent(existing.content, m.content);
          const mergedTags = [...new Set([...(existing.tags || []), ...m.tags])];
          const mergedTopics = [...new Set([...(existing.topics || []), ...m.topics])];
          
          // Increase confidence if new info is more confident
          const newConfidence = Math.max(existing.confidence || 0.8, m.confidence);
          const newImportance = Math.max(existing.importanceScore || 0.5, m.importanceScore);
          
          await ref.update({
            content: mergedContent,
            tags: mergedTags,
            topics: mergedTopics,
            confidence: newConfidence,
            importanceScore: newImportance,
            updatedAt: now,
          });
          
          updatedMemories.push({ 
            id: ref.id, 
            content: mergedContent, 
            type: m.type, 
            tags: mergedTags,
            topics: mergedTopics,
            action: 'updated' 
          });
          
          // Update existingMemories array to reflect the update
          const existingIdx = existingMemories.findIndex(em => em.id === similarMemory.id);
          if (existingIdx >= 0) {
            existingMemories[existingIdx] = {
              ...existingMemories[existingIdx],
              content: mergedContent,
              tags: mergedTags,
              topics: mergedTopics,
              confidence: newConfidence,
              importanceScore: newImportance,
            };
          }
        } else {
          // Check for exact duplicates in existing memories
          const exactDuplicate = existingMemories.find(ex => 
            String(ex.content || '').trim().toLowerCase() === norm
          );
          if (exactDuplicate) continue;
          
          // Find related memories
          const relatedMemoryIds = findRelatedMemories(m, existingMemories);
          
          const ref = memsRef.doc();
          const doc = {
            content: m.content,
            type: m.type || 'general',
            tags: m.tags || [],
            topics: m.topics || [],
            importanceScore: m.importanceScore || 0.5,
            usageCount: 0,
            lastUsedAt: null,
            relatedMemories: relatedMemoryIds,
            isActive: true,
            source: 'auto-generated',
            confidence: m.confidence || 0.8,
            createdAt: now,
            updatedAt: now,
          };
          await ref.set(doc);
          
          // Add to existingMemories array to prevent duplicates in same batch
          existingMemories.push({ id: ref.id, ...doc });
          
          // Update related memories to include this new memory
          if (relatedMemoryIds.length > 0) {
            const batch = db.batch();
            let hasUpdates = false;
            for (const relatedId of relatedMemoryIds) {
              const relatedRef = memsRef.doc(relatedId);
              const relatedMem = existingMemories.find(em => em.id === relatedId);
              if (relatedMem) {
                const currentRelated = Array.isArray(relatedMem.relatedMemories) ? relatedMem.relatedMemories : [];
                if (!currentRelated.includes(ref.id)) {
                  batch.update(relatedRef, {
                    relatedMemories: [...currentRelated, ref.id],
                    updatedAt: now,
                  });
                  hasUpdates = true;
                }
              }
            }
            if (hasUpdates) {
              await batch.commit();
            }
          }
          
          createdMemories.push({ id: ref.id, ...doc, action: 'created' });
        }
      }
      
      return new Response(JSON.stringify({ success: true, createdMemories, updatedMemories, totalProcessed: analysis.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    return new Response(JSON.stringify({ error: 'No valid memories' }), { status: 400 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
}

// AI-powered memory extraction using LLM
async function analyzeForMemoriesWithAI(
  userMessage: string,
  aiResponse: string,
  conversation: string
): Promise<EnhancedMemoryItem[]> {
  const q = (userMessage || '').trim().toLowerCase();
  
  // Skip questions or recall-only prompts
  if (/[?]/.test(q) || /^(who|what|when|where|why|how)\b/.test(q)) {
    return [];
  }
  
  // Skip if message is too short
  if (userMessage.trim().length < 10) {
    return [];
  }
  
  try {
    // Use LLM to analyze conversation and extract memories
    const prompt = `Analyze the following conversation and extract important information about the user that should be remembered for future conversations.

Conversation context:
${conversation.slice(-2000)} // Last 2000 chars for context

User's latest message: "${userMessage}"
Assistant's response: "${aiResponse}"

Extract meaningful facts, preferences, personal information, work/project details, or context that would be useful to remember. 

Return ONLY a JSON array of memory objects. Each memory should have:
- content: A clear, concise statement of what to remember (e.g., "User prefers dark mode", "User works at Tech Corp", "User's favorite programming language is Python")
- type: One of: "fact", "preference", "personal", "work", "project", or "general"
- tags: Array of relevant tags (e.g., ["ui", "preference"] or ["work", "company"])
- topics: Array of topics this relates to (e.g., ["technology", "programming"])
- confidence: Number between 0 and 1 indicating how confident you are this is accurate
- importanceScore: Number between 0 and 1 indicating how important this memory is (higher = more important)

IMPORTANT:
- Only extract information explicitly stated or clearly implied by the user
- Do NOT extract information from the assistant's response unless it's confirming user-stated facts
- Skip questions, requests for information, or temporary statements
- Focus on persistent facts, preferences, and context
- Return empty array [] if nothing meaningful to remember
- Maximum 5 memories per conversation

Format: [{"content": "...", "type": "...", "tags": [...], "topics": [...], "confidence": 0.9, "importanceScore": 0.8}, ...]`;

    const messages = [
      {
        role: 'system',
        content: 'You are a memory extraction assistant. Extract only factual, persistent information about users. Return valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const result = await callLlamaChat(messages, 'llama-3.3-70b-or');
    const responseText = result.content.trim();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      // Try to find JSON array directly
      const arrayMatch = responseText.match(/(\[[\s\S]*\])/);
      if (arrayMatch) {
        jsonText = arrayMatch[1];
      }
    }
    
    const memories = JSON.parse(jsonText);
    
    if (!Array.isArray(memories)) {
      return [];
    }
    
    // Validate and normalize memories
    return memories
      .filter((m: any) => m.content && m.content.trim().length >= 8)
      .map((m: any) => ({
        content: String(m.content || '').trim(),
        type: (['fact', 'preference', 'personal', 'work', 'project', 'general'].includes(m.type) 
          ? m.type 
          : 'general') as EnhancedMemoryItem['type'],
        tags: Array.isArray(m.tags) ? m.tags.filter((t: any) => typeof t === 'string') : [],
        topics: Array.isArray(m.topics) ? m.topics.filter((t: any) => typeof t === 'string') : [],
        confidence: Math.max(0, Math.min(1, Number(m.confidence) || 0.8)),
        importanceScore: Math.max(0, Math.min(1, Number(m.importanceScore) || 0.5)),
        relatedEntities: Array.isArray(m.relatedEntities) ? m.relatedEntities : undefined,
      }))
      .slice(0, 5); // Limit to 5 memories
      
  } catch (error) {
    console.error('AI memory extraction failed:', error);
    // Fallback to basic extraction if AI fails
    return analyzeForMemoriesFallback(userMessage, aiResponse);
  }
}

// Fallback to regex-based extraction if AI fails
function analyzeForMemoriesFallback(userMessage: string, aiResponse: string): EnhancedMemoryItem[] {
  const out: EnhancedMemoryItem[] = [];
  const push = (content: string, type: EnhancedMemoryItem['type'] = 'general', tags: string[] = [], confidence = 0.7, importanceScore = 0.5) => {
    const c = (content || '').trim();
    if (c.length >= 8) {
      out.push({ content: c, type, tags, topics: tags, confidence, importanceScore });
    }
  };
  
  const q = (userMessage || '').trim().toLowerCase();
  if (/[?]/.test(q) || /^(who|what|when|where|why|how)\b/.test(q)) return out;
  
  const name = userMessage.match(/(?:my name is|call me|i'm|i am)\s+([a-zA-Z\s]+)/i);
  if (name) push(`User's name is ${name[1].trim()}`, 'personal', ['name'], 0.9, 0.8);
  
  const city = userMessage.match(/(?:i live in|i'm from|located in|my location is|i'm based in)\s+([a-zA-Z\s,]+)/i);
  if (city) push(`User lives in ${city[1].trim()}`, 'personal', ['location'], 0.85, 0.6);
  
  const birthday = userMessage.match(/(?:my birthday is|born on|birth date is)\s*[:\-]?\s*([a-zA-Z]+\s*\d{1,2})/i);
  if (birthday) push(`User birthday is ${birthday[1].trim()}`, 'personal', ['birthday'], 0.9, 0.7);
  
  const pref = userMessage.match(/(?:i prefer|i like|from now on|i want|i need)\s+(.{4,})/i);
  if (pref) push(`Preference: ${pref[1].trim()}`, 'preference', ['preference'], 0.8, 0.6);
  
  return out;
}

// Find similar memories using text similarity
async function findSimilarMemories(
  newMemory: EnhancedMemoryItem,
  existingMemories: Array<{ id: string; content?: string; [key: string]: any }>
): Promise<{ id: string; data: any } | null> {
  const newContent = newMemory.content.toLowerCase().trim();
  
  for (const existing of existingMemories) {
    const existingContent = String(existing.content || '').toLowerCase().trim();
    if (!existingContent) continue;
    
    // Calculate similarity using Jaccard similarity (word-based)
    const similarity = calculateTextSimilarity(newContent, existingContent);
    
    // If similarity is high (>0.85), consider it a match
    if (similarity > 0.85) {
      return { id: existing.id, data: existing };
    }
  }
  
  return null;
}

// Calculate Jaccard similarity between two texts
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

// Merge memory content intelligently
function mergeMemoryContent(existing: string, newContent: string): string {
  // If new content is more detailed or contains existing content, use new
  if (newContent.length > existing.length * 1.2) {
    return newContent;
  }
  // If existing is more detailed, keep it
  if (existing.length > newContent.length * 1.2) {
    return existing;
  }
  // Otherwise, prefer the more recent one
  return newContent;
}

// Find related memories based on topics, tags, entities, and content similarity
function findRelatedMemories(
  newMemory: EnhancedMemoryItem,
  existingMemories: Array<{ id: string; content?: string; topics?: string[]; tags?: string[]; type?: string; [key: string]: any }>
): string[] {
  const relatedIds: string[] = [];
  const newTopics = new Set((newMemory.topics || []).map(t => t.toLowerCase()));
  const newTags = new Set((newMemory.tags || []).map(t => t.toLowerCase()));
  const newContent = newMemory.content.toLowerCase();
  
  // Extract entities from content (simple approach - names, locations, etc.)
  const newEntities = extractEntities(newMemory.content);
  
  for (const existing of existingMemories) {
    if (!existing.id) continue;
    
    let similarity = 0;
    
    // Check topic overlap
    const existingTopics = Array.isArray(existing.topics) ? existing.topics.map(t => t.toLowerCase()) : [];
    const topicOverlap = existingTopics.filter(t => newTopics.has(t)).length;
    if (topicOverlap > 0) {
      similarity += 0.3;
    }
    
    // Check tag overlap
    const existingTags = Array.isArray(existing.tags) ? existing.tags.map(t => t.toLowerCase()) : [];
    const tagOverlap = existingTags.filter(t => newTags.has(t)).length;
    if (tagOverlap > 0) {
      similarity += 0.2;
    }
    
    // Check type match
    if (existing.type === newMemory.type && newMemory.type !== 'general') {
      similarity += 0.2;
    }
    
    // Check entity overlap
    const existingContent = String(existing.content || '').toLowerCase();
    const existingEntities = extractEntities(existingContent);
    const entityOverlap = Array.from(existingEntities).filter((e: string) => newEntities.has(e)).length;
    if (entityOverlap > 0) {
      similarity += 0.2;
    }
    
    // Check content similarity
    const contentSimilarity = calculateTextSimilarity(newContent, existingContent);
    if (contentSimilarity > 0.3) {
      similarity += contentSimilarity * 0.1;
    }
    
    // If similarity is high enough, consider it related
    if (similarity >= 0.4) {
      relatedIds.push(existing.id);
    }
  }
  
  // Limit to top 5 most related
  return relatedIds.slice(0, 5);
}

// Extract entities from text (simple approach)
function extractEntities(text: string): Set<string> {
  const entities = new Set<string>();
  
  // Extract capitalized words/phrases (potential names, places)
  const capitalizedMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
  if (capitalizedMatches) {
    capitalizedMatches.forEach(match => {
      if (match.length > 2 && match.length < 50) {
        entities.add(match.toLowerCase());
      }
    });
  }
  
  // Extract common entity patterns
  const patterns = [
    /(?:works? at|employed by|company is)\s+([A-Z][a-zA-Z\s&]+)/gi,
    /(?:lives? in|from|located in)\s+([A-Z][a-zA-Z\s]+)/gi,
    /(?:studies?|studied|university is|school is)\s+([A-Z][a-zA-Z\s]+)/gi,
  ];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const entity = match.replace(/^(?:works? at|employed by|company is|lives? in|from|located in|studies?|studied|university is|school is)\s+/i, '').trim();
        if (entity.length > 2 && entity.length < 50) {
          entities.add(entity.toLowerCase());
        }
      });
    }
  });
  
  return entities;
}

 
