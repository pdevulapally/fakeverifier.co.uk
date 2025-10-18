import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Get a specific public report by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // First try to get from chatHistory (conversations made public)
    let reportRef = db.collection('chatHistory').doc(id);
    let report = await reportRef.get();
    let reportData = report.data();

    // If not found in chatHistory, try publicReports collection
    if (!report.exists) {
      reportRef = db.collection('publicReports').doc(id);
      report = await reportRef.get();
      reportData = report.data();
    }

    if (!report.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    // Check if the conversation is public and has the right privacy level
    if (!reportData?.isPublic || reportData?.privacyLevel !== 'public') {
      return NextResponse.json({ 
        error: 'Access denied - This conversation is private and can only be accessed by the owner' 
      }, { status: 403 });
    }

    // Format the full conversation content
    const formatConversationContent = (messages: any[]) => {
      if (!messages || messages.length === 0) return 'No content available';
      
      return messages.map((msg, index) => {
        const role = msg.role === 'user' ? 'User' : 'FakeVerifier';
        const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';
        return `**${role}** (${timestamp}):\n${msg.content}`;
      }).join('\n\n---\n\n');
    };

    // Extract fact-checking data from AI responses
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
            const sources = sourceMatches.map(url => {
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

    // Extract fact-checking data from the conversation
    const factCheckData = extractFactCheckData(reportData.messages || []);

    const responseData = {
      id: report.id,
      title: reportData.title || 'Untitled Conversation',
      content: formatConversationContent(reportData.messages || []),
      verdict: factCheckData.verdict,
      confidence: factCheckData.confidence,
      author: reportData.author || 'Anonymous',
      views: reportData.views || 0,
      likes: reportData.likes || 0,
      dislikes: reportData.dislikes || 0,
      tags: reportData.tags || [],
      sources: factCheckData.sources,
      evidence: factCheckData.evidence,
      explanation: factCheckData.explanation,
      createdAt: reportData?.createdAt?.toDate?.() || new Date(),
      updatedAt: reportData?.updatedAt?.toDate?.() || new Date(),
      messages: reportData.messages || [] // Include full messages for detailed view
    };

    // Increment view count
    await reportRef.update({
      views: (reportData?.views || 0) + 1,
      updatedAt: new Date()
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

// Update a public report
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { 
      title, 
      content, 
      verdict, 
      confidence, 
      tags, 
      sources,
      userId 
    } = await req.json();

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const reportRef = db.collection('publicReports').doc(id);
    const report = await reportRef.get();

    if (!report.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if user owns the report
    if (report.data()?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (verdict) updateData.verdict = verdict;
    if (confidence !== undefined) updateData.confidence = confidence;
    if (tags) updateData.tags = tags;
    if (sources) updateData.sources = sources;

    await reportRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}

// Delete a public report
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await req.json();

    if (!db) {
      console.error('Firebase Admin database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const reportRef = db.collection('publicReports').doc(id);
    const report = await reportRef.get();

    if (!report.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if user owns the report
    if (report.data()?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await reportRef.update({
      isActive: false,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
