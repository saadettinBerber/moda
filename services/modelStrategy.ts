import type { AnalysisResult, ChatMessage } from '../types';

export type ModelProgressReport = {
  progress: number;
  text: string;
};

export type ProgressCallback = (report: ModelProgressReport) => void;

export interface ModelStrategy {
  name: string;
  initialize(onProgress?: ProgressCallback): Promise<void>;
  generateResponse(query: string, analysisResult: AnalysisResult | null, conversationHistory?: ChatMessage[]): Promise<string>;
  isReady(): boolean;
  isLoading(): boolean;
  getStatus(): 'loading' | 'ready' | 'error';
}

export interface ModelConfig {
  name: string;
  displayName: string;
  modelId: string;
  promptTemplate: (context: string, query: string, kibbeType?: string) => string;
  conversationTemplate?: (context: string, query: string, kibbeType?: string, history?: ChatMessage[]) => string;
  maxTokens?: number;
  temperature?: number;
  runtime: 'cpu' | 'api';
}

export interface ApiConfig extends Omit<ModelConfig, 'modelId' | 'runtime'> {
  model: string; // API model name
  runtime: 'api';
}

// Shared prompt templates
const createStandardPrompt = (context: string, query: string, kibbeType?: string) => {
  const kibbeContext = kibbeType ? `Kullanıcının Kibbe vücut tipi "${kibbeType}" olarak analiz edilmiştir. ` : '';
  return `Sen David Kibbe'nin vücut tipleri sisteminde uzmanlaşmış Türkçe konuşan bir stil danışmanısın. ${kibbeContext}

Aşağıdaki bağlamı kullanarak soruyu yanıtla. Bağlam dışında bilgi uydurma ve Türkçe yanıt ver.

BAĞLAM:
${context}

Soru: ${query}
Yanıt:`;
};

const createConversationPrompt = (context: string, query: string, kibbeType?: string, history?: ChatMessage[]) => {
  const kibbeContext = kibbeType ? `Kullanıcının Kibbe vücut tipi "${kibbeType}" olarak analiz edilmiştir. ` : '';

  // Sadece son 3 mesajı al
  const recentHistory = history ? history.slice(-3) : [];
  const historyText = recentHistory.length > 0
    ? recentHistory.map(msg => `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`).join('\n') + '\n'
    : '';

  return `Sen David Kibbe'nin vücut tipleri sisteminde uzmanlaşmış Türkçe konuşan bir stil danışmanısın. ${kibbeContext}

${historyText}BAĞLAM:
${context}

Kullanıcı: ${query}
Asistan:`;
};

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'distilgpt2': {
    name: 'distilgpt2',
    displayName: 'DistilGPT-2 (CPU)',
    modelId: 'distilgpt2',
    runtime: 'cpu',
    promptTemplate: createStandardPrompt,
    conversationTemplate: createConversationPrompt,
    maxTokens: 150,
    temperature: 0.8
  },
  'gpt2': {
    name: 'gpt2',
    displayName: 'GPT-2 (CPU)',
    modelId: 'gpt2',
    runtime: 'cpu',
    promptTemplate: createStandardPrompt,
    conversationTemplate: (context: string, query: string, kibbeType?: string, history?: ChatMessage[]) => {
      const kibbeContext = kibbeType ? `Kullanıcının Kibbe vücut tipi "${kibbeType}" olarak analiz edilmiştir. ` : '';

      // GPT-2 için daha küçük context
      const recentHistory = history ? history.slice(-2) : [];
      const historyText = recentHistory.length > 0
        ? recentHistory.map(msg => `${msg.role === 'user' ? 'S' : 'C'}: ${msg.content}`).join('\n') + '\n'
        : '';

      return `Stil danışmanı. ${kibbeContext}

${historyText}BAĞLAM: ${context}

S: ${query}
C:`;
    },
    maxTokens: 120,
    temperature: 0.8
  }
};

// API Configurations
export const API_CONFIGS: Record<string, ApiConfig> = {
  'gemini-flash': {
    name: 'gemini-flash',
    displayName: 'Gemini 2.5 Flash (API)',
    model: 'gemini-2.5-flash',
    runtime: 'api',
    promptTemplate: createStandardPrompt,
    conversationTemplate: createConversationPrompt,
    maxTokens: 200,
    temperature: 0.7
  },
  'gemini-pro': {
    name: 'gemini-pro',
    displayName: 'Gemini 1.5 Pro (API)',
    model: 'gemini-1.5-pro',
    runtime: 'api',
    promptTemplate: createStandardPrompt,
    conversationTemplate: createConversationPrompt,
    maxTokens: 300,
    temperature: 0.6
  }
};
