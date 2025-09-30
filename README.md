# AI Kibbe Vücut Tipi Analizi

Bu uygulama, David Kibbe'nin vücut tipi sistemini kullanarak AI destekli stil analizi yapar.

## Özellikler

- **Fotoğraf Analizi**: Gemini 2.5 Flash ile otomatik anket doldurma
- **Interaktif Anket**: 16 soruluk Kibbe vücut tipi değerlendirmesi
- **AI Chat**: Hugging Face Transformers.js ile yerel RAG tabanlı stil danışmanlığı
- **CPU Tabanlı**: Tüm modeller CPU'da çalışır, GPU gerektirmez

## Teknoloji Stack

- **Frontend**: React 19.1.1 + TypeScript + Vite
- **AI Modelleri**: 
  - Google Gemini 2.5 Flash (fotoğraf analizi)
  - Hugging Face Transformers.js (yerel chat)
    - Microsoft Phi-2
    - TinyLlama 1.1B
    - Google Gemma 2B
- **Stil**: Özel CSS (framework yok)

## Kurulum

**Gereksinimler:** Node.js 18+

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. `.env.local` dosyasında `VITE_GEMINI_API_KEY` ayarlayın:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Uygulamayı çalıştırın:
   ```bash
   npm run dev
   ```

4. Tarayıcıda `http://localhost:3000` adresini açın

## Kullanım

1. **Analiz Sayfası**: Fotoğraf yükleyip otomatik anket doldurma veya manuel anket
2. **Chat Sayfası**: Kibbe tipi hakkında AI ile sohbet
3. Model seçimi: Farklı CPU tabanlı modeller arasında geçiş

## Desteklenen Modeller

- **DistilGPT-2**: Hızlı ve güvenilir model (varsayılan)
- **GPT-2**: Klasik GPT-2 modeli
- **TinyLlama 1.1B**: Chat formatında eğitilmiş model

Tüm modeller CPU'da çalışır ve internet bağlantısı gerektirir (ilk yükleme için).

## Sorun Giderme

**Model yükleme hatası alıyorsanız:**
1. İnternet bağlantınızı kontrol edin
2. Tarayıcı cache'ini temizleyin
3. Farklı bir model deneyin
4. Sayfayı yenileyin (Ctrl+F5)
