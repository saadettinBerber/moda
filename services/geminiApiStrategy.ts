import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, ChatMessage } from '../types';
import { BaseApiStrategy, type ApiConfig } from './apiStrategy';
import { ensureGeminiApiKey } from '../utils/env';

export class GeminiApiStrategy extends BaseApiStrategy {
  private client: GoogleGenAI | null = null;

  constructor(config: ApiConfig) {
    super(config);
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const apiKey = ensureGeminiApiKey();
      this.client = new GoogleGenAI({ apiKey });
      this.status = 'ready';
    } catch (error) {
      console.error('Gemini API client oluşturulamadı:', error);
      this.status = 'error';
    }
  }

  async generateResponse(query: string, analysisResult: AnalysisResult | null, conversationHistory?: ChatMessage[]): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini API client hazır değil. API anahtarını kontrol edin.');
    }

    if (this.status !== 'ready') {
      throw new Error('Gemini API servisi kullanılamıyor.');
    }

    const { context, prompt, kibbeType } = this.buildOptimizedPrompt(query, analysisResult, conversationHistory);

    if (!context || context.trim().length === 0) {
      return 'Üzgünüm, sorduğunuz konuyla ilgili David Kibbe\'nin kitabında spesifik bir bilgi bulamadım. Başka bir şekilde sormayı deneyebilir misiniz?';
    }

    try {
      console.log(`🤖 ${this.config.displayName} ile yanıt oluşturuluyor...`);
      console.log(`📝 Prompt uzunluğu: ${prompt.length} karakter`);

      const response = await this.client.models.generateContent({
        model: this.config.model,
        contents: prompt,
        config: {
          maxOutputTokens: this.config.maxTokens ?? 200,
          temperature: this.config.temperature ?? 0.7,
        }
      });

      const answer = response.text?.trim() || '';

      if (!answer || answer.length < 10) {
        return 'Üzgünüm, bu soruya uygun bir yanıt oluşturamadım. Lütfen sorunuzu farklı bir şekilde sormayı deneyin.';
      }

      // Yanıtı temizle
      const cleanedAnswer = this.cleanResponse(answer);
      console.log(`📤 Gemini API yanıtı: ${cleanedAnswer.substring(0, 100)}...`);
      
      return cleanedAnswer;
    } catch (error) {
      console.error(`❌ ${this.config.displayName} yanıt hatası:`, error);
      
      if (error instanceof Error) {
        const msg = error.message;
        if (msg.includes('API_KEY')) {
          throw new Error('❌ API anahtarı geçersiz. Lütfen .env.local dosyasındaki VITE_GEMINI_API_KEY değerini kontrol edin.');
        }
        if (msg.includes('quota')) {
          throw new Error('⏰ API kullanım kotası aşıldı. Lütfen daha sonra tekrar deneyin.');
        }
        if (msg.includes('network') || msg.includes('fetch')) {
          throw new Error('🌐 İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.');
        }
      }
      
      throw new Error(`Gemini API ile yanıt oluştururken bir sorunla karşılaştım. Lütfen tekrar deneyin.`);
    }
  }

  private cleanResponse(response: string): string {
    return response
      .replace(/^(Asistan:|Yanıt:|Cevap:|Assistant:)/i, '') // Başlangıç etiketlerini kaldır
      .replace(/\n\n+/g, '\n') // Çoklu satır sonlarını tek satır yap
      .trim();
  }
}