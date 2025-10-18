import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Auto-create or update memories based on AI analysis
export async function POST(req: NextRequest) {
  try {
    const { uid, conversation, userMessage, aiResponse } = await req.json();
    
    if (!uid || !conversation || !userMessage || !aiResponse) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Analyze the conversation to extract memory-worthy information
    const memoryAnalysis = await analyzeForMemories(userMessage, aiResponse, conversation);
    
    const createdMemories = [];
    const updatedMemories = [];

    // Process each potential memory
    for (const memory of memoryAnalysis) {
      if (memory.action === 'create') {
        const memoryData = {
          uid,
          content: memory.content,
          type: memory.type,
          tags: memory.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          source: 'auto-generated',
          confidence: memory.confidence || 0.8
        };

        const memoriesRef = db.collection('memories');
        const docRef = await memoriesRef.add(memoryData);
        
        createdMemories.push({
          id: docRef.id,
          ...memoryData,
          action: 'created'
        });
      } else if (memory.action === 'update') {
        // Find existing memory to update
        const memoriesRef = db.collection('memories');
        const snapshot = await memoriesRef
          .where('uid', '==', uid)
          .where('content', '==', memory.existingContent)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const updateData = {
            content: memory.newContent,
            type: memory.type,
            tags: memory.tags || [],
            updatedAt: new Date(),
            confidence: memory.confidence || 0.8
          };

          await doc.ref.update(updateData);
          
          updatedMemories.push({
            id: doc.id,
            ...updateData,
            action: 'updated'
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      createdMemories,
      updatedMemories,
      totalProcessed: memoryAnalysis.length
    });
  } catch (error) {
    console.error('Error auto-creating memories:', error);
    return NextResponse.json({ error: 'Failed to process memories' }, { status: 500 });
  }
}

// Analyze conversation for memory-worthy information
async function analyzeForMemories(userMessage: string, aiResponse: string, conversation: string) {
  const memories = [];
  
  // Simple pattern matching for common memory triggers
  const memoryPatterns = [
    // Name patterns
    {
      pattern: /(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/i,
      type: 'personal',
      content: (match: RegExpMatchArray) => `User's name is ${match[1].trim()}`,
      tags: ['name', 'personal']
    },
    // Location patterns
    {
      pattern: /(?:i live in|i'm from|i'm located in|my location is)\s+([a-zA-Z\s,]+)/i,
      type: 'personal',
      content: (match: RegExpMatchArray) => `User lives in ${match[1].trim()}`,
      tags: ['location', 'personal']
    },
    // Preferences
    {
      pattern: /(?:i like|i prefer|i love|my favorite)\s+([a-zA-Z\s,]+)/i,
      type: 'preference',
      content: (match: RegExpMatchArray) => `User likes ${match[1].trim()}`,
      tags: ['preference', 'likes']
    },
    // Remember requests
    {
      pattern: /(?:remember|please remember|don't forget)\s+(.+)/i,
      type: 'general',
      content: (match: RegExpMatchArray) => match[1].trim(),
      tags: ['important', 'remember']
    },
    // Job/occupation
    {
      pattern: /(?:i work as|i'm a|my job is|i do)\s+([a-zA-Z\s]+)/i,
      type: 'personal',
      content: (match: RegExpMatchArray) => `User works as ${match[1].trim()}`,
      tags: ['job', 'occupation', 'personal']
    },
    // Age
    {
      pattern: /(?:i'm|i am)\s+(\d+)\s+(?:years old|years)/i,
      type: 'personal',
      content: (match: RegExpMatchArray) => `User is ${match[1]} years old`,
      tags: ['age', 'personal']
    }
  ];

  // Check user message for memory patterns
  for (const pattern of memoryPatterns) {
    const match = userMessage.match(pattern.pattern);
    if (match) {
      memories.push({
        action: 'create',
        content: pattern.content(match),
        type: pattern.type,
        tags: pattern.tags,
        confidence: 0.9
      });
    }
  }

  // Check for update patterns (user correcting information)
  const updatePatterns = [
    {
      pattern: /(?:actually|correction|update|change)\s+(?:my name is|i'm|i am)\s+([a-zA-Z\s]+)/i,
      type: 'personal',
      existingContent: /user's name is/i,
      newContent: (match: RegExpMatchArray) => `User's name is ${match[1].trim()}`,
      tags: ['name', 'personal']
    }
  ];

  for (const pattern of updatePatterns) {
    const match = userMessage.match(pattern.pattern);
    if (match) {
      memories.push({
        action: 'update',
        existingContent: pattern.existingContent.source,
        newContent: pattern.newContent(match),
        type: pattern.type,
        tags: pattern.tags,
        confidence: 0.9
      });
    }
  }

  return memories;
}
