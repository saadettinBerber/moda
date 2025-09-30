export interface Option {
  id: string;
  text: string;
  subtext?: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export type AnalysisResult = Record<string, string>;

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
