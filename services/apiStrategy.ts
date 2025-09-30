import type { AnalysisResult, ChatMessage } from '../types';
import type { ModelStrategy, ModelConfig, ProgressCallback } from './modelStrategy';
import { collectRelevantChunks } from './ragUtils';
import { determineKibbeType } from '../utils/kibbe';

export interface ApiConfig extends Omit<ModelConfig, 'runtime' | 'modelId'> {
  apiKey: string;
  baseUrl?: string;
  model: string;
  runtime: 'api';
}

export abstract class BaseApiStrategy implements ModelStrategy {
  public readonly name: string;
  protected config: ApiConfig;
  protected status: 'loading' | 'ready' | 'error' = 'ready'; // API'ler hemen hazır

  constructor(config: ApiConfig) {
    this.name = config.name;
    this.config = config;
  }

  async initialize(onProgress?: ProgressCallback): Promise<void> {
    // API'ler için initialization gerekmez, hemen hazır
    this.status = 'ready';
    onProgress?.({ progress: 1, text: `${this.config.displayName} hazır!` });
  }

  abstract generateResponse(query: string, analysisResult: AnalysisResult | null, conversationHistory?: ChatMessage[]): Promise<string>;

  isReady(): boolean {
    return this.status === 'ready';
  }

  isLoading(): boolean {
    return this.status === 'loading';
  }

  getStatus(): 'loading' | 'ready' | 'error' {
    return this.status;
  }

  protected buildOptimizedPrompt(query: string, analysisResult: AnalysisResult | null, conversationHistory?: ChatMessage[]): { context: string; prompt: string; kibbeType?: string } {
    console.log(`🔍 RAG Debug - Query: "${query}"`);
    
    const relevantChunks = collectRelevantChunks(query, 2);
    console.log(`📚 RAG Debug - Found ${relevantChunks.length} chunks:`, relevantChunks.map(c => c.substring(0, 100) + '...'));
    
    let kibbeType: string | undefined;
    if (analysisResult && Object.keys(analysisResult).length > 0) {
      const determinedType = determineKibbeType(analysisResult);
      if (determinedType && determinedType !== 'Karışık (Belirgin Bir Tip Bulunamadı)') {
        kibbeType = determinedType;
      }
    }

    const context = relevantChunks.join('\n\n');
    console.log(`📝 RAG Debug - Context length: ${context.length} characters`);
    
    // Conversation history varsa optimize edilmiş template kullan
    const prompt = this.config.conversationTemplate && conversationHistory
      ? this.config.conversationTemplate(context, query, kibbeType, conversationHistory)
      : this.config.promptTemplate(context, query, kibbeType);

    return { context, prompt, kibbeType };
  }
}