import { GoogleGenAI, Type } from "@google/genai";
import { sections } from '../constants';
import { KIBBE_BOOK_CHUNKS } from './kibbeData';
import type { AnalysisResult, ChatMessage } from '../types';
import { determineKibbeType } from '../utils/kibbe';
import { ensureGeminiApiKey } from '../utils/env';
import { modelManager } from './modelManager';

let cachedClient: GoogleGenAI | null = null;

const getGeminiClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = ensureGeminiApiKey();
  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
};

function getPromptText(): string {
  const questionText = sections.map(section =>
    `Bölüm ${section.id}: ${section.title}\n` +
    section.questions.map(q =>
      `${q.id}: ${q.text}\n` +
      q.options.map(o => `  ${o.id}) ${o.text} ${o.subtext ? `(${o.subtext})` : ''}`).join('\n')
    ).join('\n\n')
  ).join('\n\n---\n\n');

  return `Bir vücut tipi analizi uzmanı olarak, sağlanan kişinin fotoğrafını analiz et. Analizine dayanarak aşağıdaki çoktan seçmeli soruları cevapla. Her soru için, sağlanan kişiyi en iyi tanımlayan seçeneğin yalnızca harfini (a, b, c, d veya e) sağla. Yanıtın, sağlanan şemaya sıkı sıkıya uyan bir JSON nesnesi olmalıdır. Nesnenin anahtarları soru tanımlayıcıları (örneğin, 'I.1', 'II.3') ve değerleri seçtiğin tek harfli cevap olmalıdır.\n\n${questionText}`;
}


function getResponseSchema() {
  const properties: Record<string, { type: Type; description: string }> = {};
  sections.forEach(section => {
    section.questions.forEach(question => {
      properties[question.id] = {
        type: Type.STRING,
        description: `Soru ${question.id} için seçilen cevap (a, b, c, d, or e).`,
      };
    });
  });

  return {
    type: Type.OBJECT,
    properties,
  };
}

// Retry mekanizması ile API çağrısı
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeImageWithGemini = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  const imagePart = {
    inlineData: {
      mimeType,
      data: base64Image,
    },
  };

  const textPart = {
    text: getPromptText(),
  };

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Gemini API çağrısı başlatılıyor... (Deneme ${attempt}/${maxRetries})`);
      const client = getGeminiClient();

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: getResponseSchema(),
        }
      });

      console.log('Gemini API yanıtı alındı:', response);

      if (!response.text) {
        throw new Error("API'den boş yanıt alındı.");
      }

      const jsonText = response.text.trim();
      console.log('JSON yanıt:', jsonText);

      const result = JSON.parse(jsonText);

      if (typeof result !== 'object' || result === null) {
        throw new Error("API'den geçersiz JSON formatı alındı.");
      }

      console.log('Analiz sonucu:', result);
      return result as AnalysisResult;

    } catch (error) {
      console.error(`Gemini API Error (Deneme ${attempt}):`, error);
      lastError = error instanceof Error ? error : new Error('Bilinmeyen hata');

      // Kalıcı hatalar için retry yapma
      if (error instanceof Error) {
        if (error.message.includes('API_KEY') ||
          error.message.includes('PERMISSION_DENIED') ||
          error.message.includes('INVALID_ARGUMENT')) {
          break; // Bu hatalar için retry yapma
        }
      }

      // Son deneme değilse bekle
      if (attempt < maxRetries) {
        const waitTime = attempt * 2000; // 2s, 4s, 6s
        console.log(`${waitTime}ms bekleyip tekrar denenecek...`);
        await delay(waitTime);
      }
    }
  }

  // Tüm denemeler başarısız oldu
  if (lastError) {
    // Daha spesifik hata mesajları
    if (lastError.message.includes('API_KEY')) {
      throw new Error("❌ API anahtarı geçersiz. Lütfen .env.local dosyasındaki VITE_GEMINI_API_KEY değerini kontrol edin.");
    }
    if (lastError.message.includes('quota')) {
      throw new Error("⏰ API kullanım kotası aşıldı. Lütfen daha sonra tekrar deneyin.");
    }
    if (lastError.message.includes('PERMISSION_DENIED')) {
      throw new Error("🔒 API erişim izni reddedildi. API anahtarınızı kontrol edin.");
    }
    if (lastError.message.includes('INVALID_ARGUMENT')) {
      throw new Error("📷 Geçersiz resim formatı. Lütfen farklı bir resim deneyin (JPG, PNG).");
    }
    if (lastError.message.includes('network') || lastError.message.includes('fetch')) {
      throw new Error("🌐 İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.");
    }
    if (lastError.message.includes('try again later') || lastError.message.includes('503')) {
      throw new Error("⚠️ Gemini servisi geçici olarak kullanılamıyor. Lütfen 5-10 dakika sonra tekrar deneyin.");
    }

    // Orijinal hata mesajını göster
    throw new Error(`🔧 API Hatası: ${lastError.message}\n\nLütfen birkaç dakika sonra tekrar deneyin.`);
  }

  throw new Error("❌ Yapay zeka analizi sırasında beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
};


export const getStyleSummary = async (analysisResult: AnalysisResult): Promise<string> => {
  const kibbeType = determineKibbeType(analysisResult);

  const prompt = `Bir stil danışmanı ve Kibbe vücut tipi uzmanı olarak hareket ediyorsun. Bir kullanıcının vücut tipi, verdiği cevaplara göre "${kibbeType}" olarak hesaplandı.

Lütfen bu sonuca dayanarak kullanıcı için kısa, pozitif ve cesaretlendirici bir özet oluştur.

Özetin şunları içermelidir:
1. "${kibbeType}" tipinin ne anlama geldiğine dair kısa bir açıklama (örneğin, "Dengeli ve keskin hatların birleşimi...").
2. Bu vücut tipine en uygun 2-3 temel stil önerisi (örneğin, kumaş türleri, kıyafet kesimleri, aksesuar seçimleri).
3. Önerilerini sunarken pozitif ve güçlendirici bir dil kullan.

Lütfen cevabını sadece oluşturduğun özet metni olacak şekilde, başka hiçbir ekleme yapmadan, Markdown formatlaması olmadan düz metin olarak ver.`;

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Summary API Error:", error);
    throw new Error("Stil özeti oluşturulurken bir hata oluştu.");
  }
}

const retrieveRelevantChunks = (query: string): string[] => {
  const lowerCaseQuery = query.toLowerCase();
  const keywords = lowerCaseQuery.split(/\s+/).filter(word => word.length > 3);

  if (keywords.length === 0) {
    keywords.push(lowerCaseQuery);
  }

  const scoredChunks = KIBBE_BOOK_CHUNKS.map(chunk => {
    let score = 0;
    const lowerCaseChunk = chunk.toLowerCase();
    keywords.forEach(keyword => {
      if (lowerCaseChunk.includes(keyword)) {
        score++;
      }
    });
    const titleMatch = chunk.match(/^([\w\s]+)\s\(\w\):/);
    if (titleMatch && lowerCaseQuery.includes(titleMatch[1].toLowerCase().trim())) {
      score += 5;
    }
    return { chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  return scoredChunks.filter(item => item.score > 0).slice(0, 2).map(item => item.chunk);
};

export const getChatbotResponse = async (query: string, analysisResult: AnalysisResult | null, conversationHistory?: ChatMessage[]): Promise<string> => {
  // Model manager otomatik olarak API fallback kullanacak
  return await modelManager.generateResponse(query, analysisResult, conversationHistory);
};

// Gemini ile basit RAG fallback
const getGeminiFallbackResponse = async (query: string, analysisResult: AnalysisResult | null, conversationHistory?: ChatMessage[]): Promise<string> => {
  const relevantChunks = retrieveRelevantChunks(query);

  if (relevantChunks.length === 0) {
    return "Üzgünüm, sorduğunuz konuyla ilgili David Kibbe'nin kitabında spesifik bir bilgi bulamadım. Başka bir şekilde sormayı deneyebilir misiniz?";
  }

  let kibbeType: string | undefined;
  if (analysisResult && Object.keys(analysisResult).length > 0) {
    const determinedType = determineKibbeType(analysisResult);
    if (determinedType && determinedType !== "Karışık (Belirgin Bir Tip Bulunamadı)") {
      kibbeType = determinedType;
    }
  }

  const context = relevantChunks.join('\n\n');
  const kibbeContext = kibbeType ? `Kullanıcının Kibbe vücut tipi "${kibbeType}" olarak analiz edilmiştir. ` : '';

  const prompt = `Sen David Kibbe'nin vücut tipleri sisteminde uzmanlaşmış Türkçe konuşan bir stil danışmanısın. ${kibbeContext}

Kullanıcının sorusunu YALNIZCA aşağıda verilen bağlamı kullanarak yanıtla:
- Yardımcı ol, pozitif ve cesaretlendirici bir dil kullan
- Türkçe yanıt ver
- Eğer cevap bağlamda yoksa, sağlanan materyalde bilgi bulamadığını belirt
- Dışarıdan bilgi kullanma, sadece verilen bağlamı kullan

BAĞLAM:
${context}

KULLANICI SORUSU: ${query}`;

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || 'Yanıt oluşturulamadı.';
  } catch (error) {
    console.error("Gemini fallback hatası:", error);
    throw new Error("Sohbet hizmeti geçici olarak kullanılamıyor.");
  }
};

// Model manager kullanımı için yardımcı fonksiyonlar
export const getModelStatus = () => modelManager.getStatus();
export const getActiveModelName = () => modelManager.getActiveModelDisplayName();
export const isModelReady = () => modelManager.isReady();
export const isModelLoading = () => modelManager.isLoading();

// Test fonksiyonu - API key'in çalışıp çalışmadığını kontrol eder
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Test mesajı - sadece "OK" yanıtla',
    });

    console.log('Gemini bağlantı testi başarılı:', response.text);
    return true;
  } catch (error) {
    console.error('Gemini bağlantı testi başarısız:', error);
    return false;
  }
};