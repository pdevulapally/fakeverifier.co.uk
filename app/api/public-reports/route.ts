import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Get all public reports with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const verdict = searchParams.get('verdict') || 'all';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Build query - only show conversations that are explicitly public
    let query = db.collection('chatHistory')
      .where('isPublic', '==', true)
      .where('privacyLevel', '==', 'public');

    // Apply verdict filter (if we have verdict data in chatHistory)
    if (verdict !== 'all') {
      const verdictMap: { [key: string]: string } = {
        'likely-real': 'Likely Real',
        'likely-fake': 'Likely Fake',
        'mixed': 'Mixed',
        'unverified': 'Unverified'
      };
      // Note: We'll need to add verdict data to chatHistory or create a separate mapping
      // For now, we'll skip verdict filtering for chatHistory conversations
    }

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const totalReports = totalSnapshot.size;

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.orderBy('createdAt', 'desc');
        break;
      case 'oldest':
        query = query.orderBy('createdAt', 'asc');
        break;
      case 'most-viewed':
        query = query.orderBy('views', 'desc');
        break;
      case 'highest-confidence':
        query = query.orderBy('confidence', 'desc');
        break;
      default:
        query = query.orderBy('createdAt', 'desc');
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    const snapshot = await query.get();
    const reports = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Create a better content preview from the conversation
      const getContentPreview = (messages: any[]) => {
        if (!messages || messages.length === 0) return 'No content available';
        
        // Get the first user message and first assistant response
        const userMessage = messages.find(msg => msg.role === 'user');
        const assistantMessage = messages.find(msg => msg.role === 'assistant');
        
        if (userMessage && assistantMessage) {
          return `${userMessage.content.substring(0, 100)}${userMessage.content.length > 100 ? '...' : ''}`;
        } else if (userMessage) {
          return userMessage.content.substring(0, 150);
        } else if (assistantMessage) {
          return assistantMessage.content.substring(0, 150);
        }
        
        return 'No content available';
      };
      
      // Extract fact-checking data from the conversation
      const extractFactCheckData = (messages: any[]) => {
        if (!messages || messages.length === 0) {
          return { verdict: 'Unverified', confidence: 0, sources: [], evidence: [], explanation: '' };
        }

        // Look for AI responses that contain fact-checking data
        const aiMessages = messages.filter(msg => msg.role === 'assistant');
        
        for (const aiMsg of aiMessages) {
          const content = aiMsg.content;
          
          // Try to extract JSON data if the response contains structured fact-checking
          try {
            // Look for JSON-like structure in the content
            const jsonMatch = content.match(/\{[\s\S]*"verdict"[\s\S]*\}/);
            if (jsonMatch) {
              const factCheckData = JSON.parse(jsonMatch[0]);
              return {
                verdict: factCheckData.verdict || 'Unverified',
                confidence: factCheckData.confidence || 0,
                sources: factCheckData.sources || [],
                evidence: factCheckData.evidenceSnippets || factCheckData.evidence || [],
                explanation: factCheckData.explanation || ''
              };
            }
          } catch (e) {
            // Continue to next method if JSON parsing fails
          }

          // Try to extract verdict from text patterns
          const verdictPatterns = {
            'Likely Real': /likely real|probably true|appears to be true|seems accurate/i,
            'Likely Fake': /likely fake|probably false|appears to be false|seems inaccurate/i,
            'Mixed': /mixed|partially true|some truth|partially false/i,
            'Unverified': /unverified|cannot verify|insufficient|not enough/i
          };

          for (const [verdict, pattern] of Object.entries(verdictPatterns)) {
            if (pattern.test(content)) {
              // Try to extract confidence percentage
              const confidenceMatch = content.match(/(\d+)%|(\d+)\s*percent|confidence[:\s]*(\d+)/i);
              const confidence = confidenceMatch ? parseInt(confidenceMatch[1] || confidenceMatch[2] || confidenceMatch[3]) : 0;

              // Extract sources (look for URLs or source mentions)
              const sourceMatches = content.match(/https?:\/\/[^\s]+/g) || [];
              const sources = sourceMatches.map((url: string) => {
                // Try to extract a meaningful name from the URL
                try {
                  const urlObj = new URL(url);
                  const domain = urlObj.hostname.replace('www.', '');
                  return { name: domain, url };
                } catch (e) {
                  return { name: 'Source', url };
                }
              });

              // Extract evidence snippets (look for bullet points, numbered lists, or evidence sections)
              const evidencePatterns = [
                /•\s*(.+)/g,  // Bullet points
                /\d+\.\s*(.+)/g,  // Numbered lists
                /evidence[:\s]*(.+)/gi,  // Evidence sections
                /found[:\s]*(.+)/gi,  // "Found:" sections
                /research shows[:\s]*(.+)/gi,  // "Research shows:" sections
                /according to[:\s]*(.+)/gi,  // "According to:" sections
                /studies show[:\s]*(.+)/gi,  // "Studies show:" sections
                /medical research[:\s]*(.+)/gi,  // "Medical research:" sections
                /scientific evidence[:\s]*(.+)/gi  // "Scientific evidence:" sections
              ];
              
              const evidence = [];
              for (const pattern of evidencePatterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                  if (match[1] && match[1].trim().length > 10) {
                    evidence.push(match[1].trim());
                  }
                }
              }

              // Also look for evidence in the full content if no specific patterns found
              if (evidence.length === 0) {
                // Look for sentences that contain evidence indicators
                const evidenceIndicators = [
                  /[^.!?]*(?:research|study|studies|evidence|data|findings|results|concluded|showed|demonstrated|proved|confirmed)[^.!?]*[.!?]/gi
                ];
                
                for (const pattern of evidenceIndicators) {
                  let match;
                  while ((match = pattern.exec(content)) !== null) {
                    if (match[0] && match[0].trim().length > 20) {
                      evidence.push(match[0].trim());
                    }
                  }
                }
              }

              // Extract explanation (look for explanation sections)
              const explanationMatch = content.match(/explanation[:\s]*(.+?)(?:\n\n|$)/is);
              const explanation = explanationMatch ? explanationMatch[1].trim() : '';

              return { verdict, confidence, sources, evidence, explanation };
            }
          }
        }

        return { verdict: 'Unverified', confidence: 0, sources: [], evidence: [], explanation: '' };
      };

      const factCheckData = extractFactCheckData(data.messages || []);

      return {
        id: doc.id,
        title: data.title || 'Untitled Conversation',
        content: getContentPreview(data.messages || []),
        verdict: factCheckData.verdict,
        confidence: factCheckData.confidence,
        author: data.author || 'Anonymous',
        views: data.views || 0,
        likes: data.likes || 0,
        dislikes: data.dislikes || 0,
        tags: data.tags || [],
        sources: factCheckData.sources,
        evidence: factCheckData.evidence,
        explanation: factCheckData.explanation,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        messageCount: data.messages?.length || 0
      };
    });

    // Filter by search term (client-side for now, could be moved to server-side)
    const filteredReports = reports.filter(report => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        report.title?.toLowerCase().includes(searchLower) ||
        report.content?.toLowerCase().includes(searchLower) ||
        report.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
        report.author?.toLowerCase().includes(searchLower)
      );
    });

    return NextResponse.json({
      reports: filteredReports,
      pagination: {
        page,
        limit,
        total: totalReports,
        totalPages: Math.ceil(totalReports / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching public reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// Create a new public report
export async function POST(req: NextRequest) {
  try {
    const { 
      title, 
      content, 
      verdict, 
      confidence, 
      author, 
      tags, 
      sources, 
      userId 
    } = await req.json();

    if (!title || !content || !verdict || !author || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const reportData = {
      title: title.trim(),
      content: content.trim(),
      verdict,
      confidence: confidence || 0,
      author: author.trim(),
      tags: tags || [],
      sources: sources || [],
      views: 0,
      likes: 0,
      dislikes: 0,
      isPublic: true,
      isActive: true,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const reportsRef = db.collection('publicReports');
    const docRef = await reportsRef.add(reportData);
    
    return NextResponse.json({ 
      id: docRef.id, 
      ...reportData 
    });
  } catch (error) {
    console.error('Error creating public report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
