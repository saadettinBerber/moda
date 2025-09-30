import type { ModelStrategy, ProgressCallback } from './modelStrategy';
import { CPUTransformersStrategy } from './cpuTransformersStrategy';
import { GeminiApiStrategy } from './geminiApiStrategy';
import { MODEL_CONFIGS, API_CONFIGS } from './modelStrategy';
import type { AnalysisResult, ChatMessage } from '../types';
import { ensureGeminiApiKey } from '../utils/env';

export class ModelManager {
  private strategies: Map<string, ModelStrategy> = new Map();
  private activeStrategy: ModelStrategy | null = null;
  private preferredModel: string;
  private fallbackApiModel: string;

  constructor() {
    // Varsayılan olarak API kullan (hızlı başlangıç için)
    this.preferredModel = 'gemini-flash';
    this.fallbackApiModel = 'gemini-flash';
    this.initializeStrategies();
  }

  private initializeStrategies() {
    // CPU tabanlı modeller
    Object.values(MODEL_CONFIGS).forEach(config => {
      const strategy = new CPUTransformersStrategy(config);
      this.strategies.set(config.name, strategy);
    });

    // API tabanlı modeller
    try {
      const apiKey = ensureGeminiApiKey();
      Object.values(API_CONFIGS).forEach(config => {
        const apiConfig = { ...config, apiKey };
        const strategy = new GeminiApiStrategy(apiConfig);
        this.strategies.set(config.name, strategy);
      });
    } catch (error) {
      console.warn('API anahtarı bulunamadı, API modelleri devre dışı:', error);
    }
  }

  private getRuntime(name: string): 'cpu' | 'api' | undefined {
    return MODEL_CONFIGS[name]?.runtime || API_CONFIGS[name]?.runtime;
  }

  async initializeModel(modelName?: string, onProgress?: ProgressCallback): Promise<void> {
    const targetModel = modelName || this.preferredModel;
    const strategy = this.strategies.get(targetModel);

    if (!strategy) {
      throw new Error(`Model "${targetModel}" bulunamadı.`);
    }

    try {
      console.log(`🚀 Model "${targetModel}" başlatılıyor...`);
      console.log('📊 Tarayıcı bilgileri:', {
        userAgent: navigator.userAgent,
        webAssembly: typeof WebAssembly !== 'undefined'
      });

      const startTime = Date.now();
      await strategy.initialize(onProgress);
      const endTime = Date.now();

      this.activeStrategy = strategy;
      console.log(`✅ Model "${targetModel}" başarıyla yüklendi! (${Math.round((endTime - startTime) / 1000)}s)`);
    } catch (error) {
      console.error(`❌ Model "${targetModel}" yüklenemedi:`, error);
      this.activeStrategy = null;

      if (error instanceof Error) {
        console.error('🔍 Detaylı hata bilgisi:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
          cause: error.cause
        });

        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.');
        }
        if (error.message.includes('WebAssembly')) {
          throw new Error('Tarayıcınız bu özelliği desteklemiyor. Lütfen Chrome, Firefox veya Safari kullanın.');
        }
        if (error.message.includes('CORS')) {
          throw new Error('Güvenlik hatası. Lütfen sayfayı yenileyin.');
        }
        throw new Error(`Model yükleme hatası: ${error.message}`);
      }

      throw error;
    }
  }

  async generateResponse(query: string, analysisResult: AnalysisResult | null, conversationHistory?: ChatMessage[]): Promise<string> {
    // Önce aktif strategy'yi dene
    if (this.activeStrategy && this.activeStrategy.isReady()) {
      try {
        return await this.activeStrategy.generateResponse(query, analysisResult, conversationHistory);
      } catch (error) {
        console.warn('Aktif model hatası, API fallback deneniyor:', error);
      }
    }

    // API fallback dene
    const fallbackStrategy = this.strategies.get(this.fallbackApiModel);
    if (fallbackStrategy && fallbackStrategy.isReady()) {
      console.log('🔄 API fallback kullanılıyor:', this.fallbackApiModel);
      return await fallbackStrategy.generateResponse(query, analysisResult, conversationHistory);
    }

    // Hiçbir seçenek yoksa hata ver
    if (!this.activeStrategy) {
      throw new Error('Hiçbir model aktif değil. Lütfen önce bir model yükleyin.');
    }

    if (!this.activeStrategy.isReady()) {
      throw new Error('Aktif model henüz hazır değil. Lütfen bekleyin.');
    }

    throw new Error('Model yanıt veremedi. Lütfen tekrar deneyin.');
  }

  isReady(): boolean {
    return this.activeStrategy?.isReady() ?? false;
  }

  isLoading(): boolean {
    return this.activeStrategy?.isLoading() ?? false;
  }

  getStatus(): 'loading' | 'ready' | 'error' | 'none' {
    if (!this.activeStrategy) return 'none';
    return this.activeStrategy.getStatus();
  }

  getActiveModelName(): string | null {
    return this.activeStrategy?.name ?? null;
  }

  getActiveModelRuntime(): 'cpu' | 'api' | null {
    if (!this.activeStrategy) return null;
    return this.getRuntime(this.activeStrategy.name) ?? null;
  }

  getActiveModelDisplayName(): string | null {
    if (!this.activeStrategy) return null;
    const config = MODEL_CONFIGS[this.activeStrategy.name] || API_CONFIGS[this.activeStrategy.name];
    return config?.displayName ?? this.activeStrategy.name;
  }

  getAvailableModels(): string[] {
    return Array.from(this.strategies.keys());
  }

  async switchModel(modelName: string, onProgress?: ProgressCallback): Promise<void> {
    if (this.activeStrategy?.name === modelName && this.activeStrategy.isReady()) {
      return;
    }

    await this.initializeModel(modelName, onProgress);
  }

  setPreferredModel(modelName: string): void {
    if (this.strategies.has(modelName)) {
      this.preferredModel = modelName;
    } else {
      throw new Error(`Model "${modelName}" mevcut değil.`);
    }
  }

  isApiAvailable(): boolean {
    return this.strategies.has(this.fallbackApiModel) && 
           this.strategies.get(this.fallbackApiModel)?.isReady() === true;
  }

  getAvailableApiModels(): string[] {
    return Object.keys(API_CONFIGS).filter(name => this.strategies.has(name));
  }

  getAvailableCpuModels(): string[] {
    return Object.keys(MODEL_CONFIGS).filter(name => this.strategies.has(name));
  }
}

export const modelManager = new ModelManager();
