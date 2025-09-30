import type { AnalysisResult, ChatMessage } from '../types';
import type { ModelStrategy, ModelConfig, ProgressCallback } from './modelStrategy';
import { collectRelevantChunks } from './ragUtils';
import { determineKibbeType } from '../utils/kibbe';
import { loadTransformers } from './transformersLoader';

type GenerationOptions = {
  max_new_tokens?: number;
  temperature?: number;
  top_p?: number;
  repetition_penalty?: number;
  do_sample?: boolean;
  pad_token_id?: number;
};

// Transformers.js pipeline tipi
type TextGenerationPipeline = any;

export class CPUTransformersStrategy implements ModelStrategy {
  public readonly name: string;
  private config: ModelConfig;
  private generator: TextGenerationPipeline | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private status: 'loading' | 'ready' | 'error' = 'loading';

  constructor(config: ModelConfig) {
    this.name = config.name;
    this.config = config;
  }

  async initialize(onProgress?: ProgressCallback): Promise<void> {
    if (this.generator) {
      onProgress?.({ progress: 1, text: 'CPU modeli hazır.' });
      return;
    }

    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.status = 'loading';

    const loadModel = async () => {
      try {
        console.log(`🚀 ${this.config.displayName} yükleniyor...`);
        console.log(`📋 Model ID: ${this.config.modelId}`);
        console.log(`🔗 Hugging Face URL: https://huggingface.co/${this.config.modelId}`);

        onProgress?.({ progress: 0.1, text: 'Transformers.js kütüphanesi yükleniyor...' });

        const transformers = await loadTransformers();

        onProgress?.({ progress: 0.2, text: 'Model pipeline oluşturuluyor...' });

        const progressHandler = (data: Record<string, unknown>) => {
          const status = typeof data.status === 'string' ? data.status : 'Model yükleniyor';
          const loaded = typeof data.loaded === 'number' ? data.loaded : 0;
          const total = typeof data.total === 'number' ? data.total : 1;
          const progress = total > 0 ? Math.min(0.2 + (loaded / total) * 0.8, 1) : 0.2;

          let displayText = status;
          if (status.includes('download')) {
            displayText = `Model dosyaları indiriliyor... ${Math.round((loaded / total) * 100)}%`;
          } else if (status.includes('load')) {
            displayText = `Model yükleniyor... ${Math.round((loaded / total) * 100)}%`;
          }

          console.log(`📥 ${this.config.displayName} [${Math.round(progress * 100)}%]: ${displayText}`);
          onProgress?.({ progress, text: displayText });
        };

        // Model pipeline'ı oluştur
        console.log(`⏳ Pipeline oluşturuluyor: ${this.config.modelId}`);

        // Önce Xenova namespace ile dene
        const modelIds = [
          `Xenova/${this.config.modelId}`,
          this.config.modelId,
          `Xenova/distilgpt2` // Son çare olarak distilgpt2
        ];
        
        let lastError: Error | null = null;
        
        for (const modelId of modelIds) {
          try {
            console.log(`🔄 Model deneniyor: ${modelId}`);
            this.generator = await transformers.pipeline('text-generation', modelId, {
              progress_callback: progressHandler,
              revision: 'main',
              quantized: false // Quantization'ı kapat
            });
            console.log(`✅ Model başarıyla yüklendi: ${modelId}`);
            break;
          } catch (error) {
            console.error(`❌ Model başarısız: ${modelId}`, error);
            lastError = error instanceof Error ? error : new Error(String(error));
            continue;
          }
        }
        
        if (!this.generator) {
          throw lastError || new Error('Hiçbir model yüklenemedi');
        }

        this.status = 'ready';
        onProgress?.({ progress: 1, text: `${this.config.displayName} hazır!` });
        console.log(`✅ ${this.config.displayName} başarıyla yüklendi`);
      } catch (error) {
        this.status = 'error';
        console.error(`❌ ${this.config.displayName} yükleme hatası:`, error);

        let errorMessage = 'Model yüklenemedi.';

        if (error instanceof Error) {
          const msg = error.message;

          if (msg.includes('<!DOCTYPE') || msg.includes('not valid JSON')) {
            errorMessage = `Model "${this.config.modelId}" Hugging Face'de bulunamadı. Model ID'si yanlış olabilir.`;
          } else if (msg.includes('404') || msg.includes('Not Found')) {
            errorMessage = `Model "${this.config.modelId}" mevcut değil. Farklı bir model deneyin.`;
          } else if (msg.includes('network') || msg.includes('fetch')) {
            errorMessage = 'İnternet bağlantısı sorunu. Bağlantınızı kontrol edin.';
          } else if (msg.includes('CORS')) {
            errorMessage = 'CORS hatası. Sayfayı yenileyin.';
          } else {
            errorMessage = `Model yükleme hatası: ${msg}`;
          }
        }

        onProgress?.({ progress: 0, text: errorMessage });
        throw new Error(errorMessage);
      } finally {
        this.isInitializing = false;
      }
    };

    this.initPromise = loadModel();
    await this.initPromise;
  }

  async generateResponse(query: string, analysisResult: AnalysisResult | null, conversationHistory?: ChatMessage[]): Promise<string> {
    if (!this.generator) {
      throw new Error('CPU modeli henüz yüklenmedi. Lütfen modeli indir.');
    }

    const relevantChunks = collectRelevantChunks(query, 2); // Daha az chunk kullan
    if (relevantChunks.length === 0) {
      return 'Veri setimizde bu soruya dair net bir bilgi bulamadım. Farklı bir şekilde sorabilir misin?';
    }

    let kibbeType: string | undefined;
    if (analysisResult && Object.keys(analysisResult).length > 0) {
      const determinedType = determineKibbeType(analysisResult);
      if (determinedType && determinedType !== 'Karışık (Belirgin Bir Tip Bulunamadı)') {
        kibbeType = determinedType;
      }
    }

    const context = relevantChunks.join('\n\n');
    
    // Conversation history varsa optimize edilmiş template kullan
    const prompt = this.config.conversationTemplate && conversationHistory
      ? this.config.conversationTemplate(context, query, kibbeType, conversationHistory)
      : this.config.promptTemplate(context, query, kibbeType);

    const options: GenerationOptions = {
      max_new_tokens: this.config.maxTokens ?? 200,
      temperature: this.config.temperature ?? 0.7,
      top_p: 0.9,
      repetition_penalty: 1.1,
      do_sample: true,
      pad_token_id: 50256 // GPT-2 pad token
    };

    try {
      console.log(`🤖 ${this.config.displayName} ile yanıt oluşturuluyor...`);
      console.log(`📝 Prompt uzunluğu: ${prompt.length} karakter`);

      const results = await this.generator(prompt, options);
      console.log(`✅ Yanıt alındı:`, results);

      // Sonucu normalize et - array veya tek obje olabilir
      const resultArray = Array.isArray(results) ? results : [results];
      const generated = resultArray[0]?.generated_text ?? '';

      // Eğer generated_text string değilse, string'e çevir
      const generatedText = typeof generated === 'string' ? generated : String(generated);

      // Prompt'u çıkarıp temizle
      let answer = generatedText.replace(prompt, '').trim();
      
      // Gereksiz tekrarları ve formatları temizle
      answer = answer
        .replace(/^(Asistan:|Yanıt:|Cevap:)/i, '') // Başlangıç etiketlerini kaldır
        .replace(/\n\n+/g, '\n') // Çoklu satır sonlarını tek satır yap
        .replace(/(.)\1{3,}/g, '$1$1') // Aynı karakterin 3+ tekrarını 2'ye düşür
        .trim();
      
      // İlk cümleyi al (nokta, ünlem veya soru işaretinde kes)
      const sentences = answer.split(/[.!?]+/);
      if (sentences.length > 1 && sentences[0].length > 20) {
        answer = sentences[0] + '.';
      }
      
      // Boş veya çok kısa yanıtları kontrol et
      if (!answer || answer.length < 15) {
        return 'Üzgünüm, bu soruya uygun bir yanıt oluşturamadım. Lütfen sorunuzu farklı bir şekilde sormayı deneyin.';
      }
      
      // Çok uzun yanıtları kısalt (200 karakter)
      if (answer.length > 200) {
        answer = answer.substring(0, 197) + '...';
      }

      console.log(`📤 Temizlenmiş yanıt: ${answer}`);
      return answer;
    } catch (error) {
      console.error(`❌ ${this.config.displayName} yanıt hatası:`, error);

      if (error instanceof Error) {
        const msg = error.message;
        if (msg.includes('<!DOCTYPE') || msg.includes('not valid JSON')) {
          throw new Error('Model dosyalarına erişim sorunu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
        }
        if (msg.includes('tokenizer')) {
          throw new Error('Tokenizer yükleme sorunu. Farklı bir model deneyin.');
        }
      }

      throw new Error(`${this.config.displayName} yanıt oluştururken bir sorunla karşılaştı. Lütfen tekrar deneyin.`);
    }
  }

  isReady(): boolean {
    return this.generator !== null && this.status === 'ready';
  }

  isLoading(): boolean {
    return this.isInitializing || this.status === 'loading';
  }

  getStatus(): 'loading' | 'ready' | 'error' {
    return this.status;
  }

  private createMockGenerator(): any {
    // Basit bir mock generator - gerçek model yüklenemediğinde kullanılır
    return async (prompt: string, options: any) => {
      console.log('🤖 Mock generator kullanılıyor...');

      // Basit template-based yanıtlar
      const responses = [
        "Üzgünüm, şu anda AI modelim tam olarak yüklenemedi. Ancak genel olarak Kibbe sistemi hakkında şunu söyleyebilirim: Her vücut tipi kendine özgü güzelliğe sahiptir ve doğru stil seçimleriyle bu güzellik ortaya çıkarılabilir.",
        "AI modelim henüz tam olarak hazır değil, ama stil konusunda genel bir öneri verebilirim: Vücut tipinize uygun kesimler ve kumaşlar seçmek, genel görünümünüzü önemli ölçüde iyileştirebilir.",
        "Model yükleme sorunu yaşıyorum, ancak Kibbe sistemi hakkında şunu söyleyebilirim: Doğru renk paleti ve aksesuar seçimi, stil yolculuğunuzda çok önemli rol oynar.",
        "Şu anda teknik bir sorun yaşıyorum, ama genel stil tavsiyesi olarak: Kendinizi rahat hissettiğiniz ve vücut tipinizi destekleyen kıyafetleri tercih etmek her zaman en iyisidir."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      return [{
        generated_text: prompt + " " + randomResponse
      }];
    };
  }
}
