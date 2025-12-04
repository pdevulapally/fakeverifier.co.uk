import { NextRequest } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Extract keywords from text
function extractKeywords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3)
    .filter(w => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(w));
  
  return new Set(words);
}

// Calculate relevance score for a memory
function calculateRelevanceScore(
  memory: any,
  contextKeywords: Set<string>,
  conversationContext: string
): number {
  let score = 0;
  
  // Base importance score (40%)
  const importanceScore = Number(memory.importanceScore || 0.5);
  score += importanceScore * 0.4;
  
  // Recency score (30%)
  const createdAt = memory.createdAt?.toDate ? memory.createdAt.toDate() : new Date(memory.createdAt || Date.now());
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - (daysSinceCreation / 90)); // Decay over 90 days
  score += recencyScore * 0.3;
  
  // Usage score (30%)
  const usageCount = Number(memory.usageCount || 0);
  const usageScore = Math.min(1, usageCount / 10); // Normalize to 0-1 (10 uses = max)
  score += usageScore * 0.3;
  
  // Semantic similarity bonus (up to +0.2)
  const memoryText = String(memory.content || '').toLowerCase();
  const memoryKeywords = extractKeywords(memoryText);
  
  // Calculate keyword overlap
  let overlap = 0;
  let totalKeywords = 0;
  for (const keyword of contextKeywords) {
    totalKeywords++;
    if (memoryKeywords.has(keyword) || memoryText.includes(keyword)) {
      overlap++;
    }
  }
  
  const similarityBonus = totalKeywords > 0 ? (overlap / totalKeywords) * 0.2 : 0;
  score += similarityBonus;
  
  // Topic/tag matching bonus
  const memoryTopics = Array.isArray(memory.topics) ? memory.topics : [];
  const memoryTags = Array.isArray(memory.tags) ? memory.tags : [];
  const allMemoryTerms = [...memoryTopics, ...memoryTags].map(t => t.toLowerCase());
  
  for (const keyword of contextKeywords) {
    if (allMemoryTerms.some(term => term.includes(keyword) || keyword.includes(term))) {
      score += 0.05; // Small bonus for topic/tag matches
      break;
    }
  }
  
  return Math.min(1, score); // Cap at 1.0
}

export async function GET(req: NextRequest) {
  try {
    if (!db) return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 501 });
    const { searchParams } = new URL(req.url);
    const uid = (searchParams.get('uid') || '').toString();
    const context = (searchParams.get('context') || '').toString();
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    
    // Reject anonymous users
    if (!uid || uid === 'demo' || uid === '') {
      return new Response(JSON.stringify({ error: 'Memories are not available for anonymous users' }), { status: 403 });
    }
    
    // Get all active memories
    const snap = await db
      .collection('users')
      .doc(uid)
      .collection('memories')
      .where('isActive', '==', true)
      .limit(100)
      .get();
    
    const memories = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as any)
    }));
    
    if (memories.length === 0) {
      return new Response(JSON.stringify({ memories: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }
    
    // If no context provided, return by importance/recency
    if (!context) {
      const sorted = memories
        .sort((a, b) => {
          const scoreA = (Number(a.importanceScore || 0.5) * 0.5) + 
                        ((Date.now() - (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || Date.now()).getTime())) / (1000 * 60 * 60 * 24 * 90)) * 0.5;
          const scoreB = (Number(b.importanceScore || 0.5) * 0.5) + 
                        ((Date.now() - (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || Date.now()).getTime())) / (1000 * 60 * 60 * 24 * 90)) * 0.5;
          return scoreB - scoreA;
        })
        .slice(0, limit);
      
      return new Response(JSON.stringify({ memories: sorted }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }
    
    // Extract keywords from context
    const contextKeywords = extractKeywords(context);
    
    // Score each memory based on relevance
    const scoredMemories = memories.map(mem => {
      const relevanceScore = calculateRelevanceScore(mem, contextKeywords, context);
      return { ...mem, relevanceScore };
    });
    
    // Sort by relevance score (descending)
    scoredMemories.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Return top N memories
    const relevantMemories = scoredMemories.slice(0, limit);
    
    return new Response(JSON.stringify({ memories: relevantMemories }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
}

