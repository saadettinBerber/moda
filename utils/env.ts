export const resolveGeminiApiKey = (): string => {
  let key = '';

  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    key = (import.meta as any).env.VITE_GEMINI_API_KEY ?? (import.meta as any).env.GEMINI_API_KEY ?? '';
  }

  if (!key && typeof process !== 'undefined' && process.env) {
    key = process.env.VITE_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? process.env.API_KEY ?? '';
  }

  return key?.trim() ?? '';
};

export const ensureGeminiApiKey = (): string => {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'Gemini API anahtarı bulunamadı. Lütfen .env.local dosyasına VITE_GEMINI_API_KEY değerini ekleyin ve uygulamayı yeniden başlatın.'
    );
  }
  return apiKey;
};
