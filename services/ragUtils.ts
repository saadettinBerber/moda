import { KIBBE_BOOK_CHUNKS } from './kibbeData';
import type { ChatMessage } from '../types';

export const collectRelevantChunks = (query: string, maxChunks = 2): string[] => {
  console.log(`🔍 RAG Chunk Collection - Query: "${query}"`);
  
  const lowerQuery = query.toLowerCase();
  const keywords = lowerQuery.split(/\s+/).filter(word => word.length > 2);
  console.log(`🔑 Keywords extracted:`, keywords);

  if (keywords.length === 0) {
    keywords.push(lowerQuery);
  }

  const scoredChunks = KIBBE_BOOK_CHUNKS.map(chunk => {
    const lowerChunk = chunk.toLowerCase();
    let score = 0;
    
    // Keyword matching
    keywords.forEach(keyword => {
      if (lowerChunk.includes(keyword)) {
        score += 1;
      }
    });
    
    // Bonus for exact phrase matches
    if (lowerChunk.includes(lowerQuery)) {
      score += 3;
    }
    
    // Bonus for title matches (chunks that start with a title)
    const titleMatch = chunk.match(/^([\w\s]+)\s\(\w\):/);
    if (titleMatch) {
      const title = titleMatch[1].toLowerCase().trim();
      if (keywords.some(keyword => title.includes(keyword))) {
        score += 2;
      }
    }
    
    return { chunk, score };
  })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks);

  console.log(`📊 Scored chunks found: ${scoredChunks.length}`, scoredChunks.map(item => ({ score: item.score, preview: item.chunk.substring(0, 50) + '...' })));

  return scoredChunks.map(item => item.chunk);
};

export const buildRagPrompt = (context: string, question: string, kibbeType?: string, conversationHistory?: ChatMessage[]) => {
  const kibbeContext = kibbeType ? `Kullanıcının Kibbe vücut tipi "${kibbeType}" olarak analiz edilmiştir. ` : '';
  
  // Sadece son 2 mesajı al
  const recentHistory = conversationHistory ? conversationHistory.slice(-2) : [];
  const historyText = recentHistory.length > 0 
    ? recentHistory.map(msg => `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`).join('\n') + '\n'
    : '';

  return `Sen David Kibbe'nin vücut tipleri sisteminde uzmanlaşmış Türkçe konuşan bir stil danışmanısın. ${kibbeContext}

${historyText}BAĞLAM:
${context}

Kullanıcı: ${question}
Asistan:`;
};
