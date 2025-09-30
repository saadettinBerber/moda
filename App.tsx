import React, { useState, useCallback, useEffect } from 'react';
import { analyzeImageWithGemini, getStyleSummary, getChatbotResponse, getModelStatus, getActiveModelName, isModelReady, isModelLoading } from './services/geminiService';
import { modelManager } from './services/modelManager';
import type { AnalysisResult, ChatMessage } from './types';
import Header from './components/Header';
import AnalysisPage from './components/AnalysisPage';
import ChatPage from './components/ChatPage';
import ResultsPage from './components/ResultsPage';

type Page = 'analysis' | 'chat' | 'results';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('analysis');

  // State for AnalysisPage
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);

  // State for ChatPage (lifted up)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Merhaba! Ben David Kibbe'nin stil ilkeleri üzerine eğitilmiş kişisel stil danışmanınızım. API ile hızlıca yanıt verebilirim, ayrıca çevrimdışı model de yükleyebilirsiniz. Analiz sayfasından vücut tipinizi belirledikten sonra size daha kişisel önerilerde bulunabilirim."
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error' | 'none'>('none');
  const [modelProgress, setModelProgress] = useState<number>(0);
  const [modelProgressText, setModelProgressText] = useState<string>('');

  // Manuel model yükleme fonksiyonu
  const handleLoadModel = useCallback(async () => {
    try {
      console.log('🚀 Model yükleme başlatılıyor...');
      setModelStatus('loading');
      setModelProgress(0);
      setModelProgressText('Model başlatılıyor...');
      setChatError(null);
      
      // Progress callback ile model manager'ı başlat
      await modelManager.initializeModel();
      
      setModelStatus('ready');
      setModelProgress(100);
      setModelProgressText('Model hazır!');
      console.log('🎉 Model başarıyla yüklendi!');
      
      // Başarı mesajı
      setChatMessages([{
        role: 'model',
        content: "🎉 Merhaba! Ben David Kibbe'nin stil ilkeleri üzerine eğitilmiş kişisel stil danışmanınızım. WebLLM modelim başarıyla yüklendi ve tamamen çevrimdışı çalışıyor!\n\nArtık sorularınızı sorabilir, stil önerilerimi alabilirsiniz. Analiz sayfasından vücut tipinizi belirledikten sonra size daha kişisel önerilerde bulunabilirim."
      }]);
      
    } catch (error) {
      console.error('💥 Model yükleme hatası:', error);
      setModelStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Model yüklenemedi';
      setChatError(errorMessage);
      setModelProgressText('Model yüklenemedi');
      
      // Hata mesajı
      setChatMessages([{
        role: 'model',
        content: `Üzgünüm, WebLLM modelim yüklenemedi. Hata: ${errorMessage}\n\nLütfen tekrar deneyin veya sayfayı yenileyin.`
      }]);
    }
  }, []);

  // Sayfa yüklendiğinde otomatik model yükleme
  useEffect(() => {
    const initializeModelOnLoad = async () => {
      // Sadece ilk yüklemede ve model durumu 'none' ise çalıştır
      if (modelStatus === 'none') {
        await handleLoadModel();
      }
    };
    
    initializeModelOnLoad();
  }, [handleLoadModel]); // handleLoadModel dependency olarak eklendi

  const handleImageSelect = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setSummary(null);
      setError(null);
    }
  };

  const handleAnalysis = useCallback(async () => {
    if (!imageFile) {
      setError('Lütfen önce bir resim seçin.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setSummary(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        if (base64String) {
          const result = await analyzeImageWithGemini(base64String, imageFile.type);
          setAnalysisResult(result);
        } else {
          throw new Error('Resim dönüştürülemedi.');
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        throw new Error('Resim dosyası okunurken bir hata oluştu.');
      };
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Analiz sırasında beklenmedik bir hata oluştu.');
      setIsLoading(false);
    }
  }, [imageFile]);

  useEffect(() => {
    if (analysisResult) {
      const fetchSummary = async () => {
        setIsSummaryLoading(true);
        setSummary(null);
        try {
          const summaryText = await getStyleSummary(analysisResult);
          setSummary(summaryText);
          // Analiz tamamlandığında sonuç sayfasına yönlendir
          setPage('results');
        } catch (err) {
          console.error("Özet alınırken hata oluştu:", err);
          setSummary("Stil özeti alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        } finally {
          setIsSummaryLoading(false);
        }
      };
      fetchSummary();

      // Update initial chat message if analysis is complete and model is ready
      if (modelStatus === 'ready') {
        setChatMessages(prevMessages => {
          if (prevMessages.length === 1 && prevMessages[0].role === 'model') {
             return [{
                role: 'model',
                content: "Merhaba! Vücut tipinize özel analiz tamamlandı. Akıllı asistan hizmetinize hazırım! Renkler, kumaşlar, kesimler veya aklınıza takılan herhangi bir stil sorusunu sorabilirsiniz."
             }];
          }
          return prevMessages;
        });
      }
    }
  }, [analysisResult, modelStatus]);
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnalysisResult(prevResult => {
      if (!prevResult) return null;
      return {
        ...prevResult,
        [questionId]: answer
      };
    });
  };



  const handleSendMessage = async (messageContent: string) => {
    const trimmedContent = messageContent.trim();
    if (!trimmedContent || isChatLoading) return;
    
    setAskedQuestions(prev => new Set(prev).add(trimmedContent));
    const userMessage: ChatMessage = { role: 'user', content: trimmedContent };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    setChatError(null);

    try {
      // Conversation history'yi geç (son mesajları hariç, çünkü user message zaten eklendi)
      const historyForModel = chatMessages;
      const response = await getChatbotResponse(userMessage.content, analysisResult, historyForModel);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setChatMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Beklenmedik bir hata oluştu.";
      setChatError(errorMessage);
      const modelMessage: ChatMessage = { role: 'model', content: `Üzgünüm, bir sorunla karşılaştım: ${errorMessage}` };
      setChatMessages(prev => [...prev, modelMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };


  return (
    <div className="kibbe-app">
      <Header activePage={page} onPageChange={setPage} />
      
      {page === 'analysis' ? (
        <AnalysisPage
          imageFile={imageFile}
          imageUrl={imageUrl}
          analysisResult={analysisResult}
          isLoading={isLoading}
          error={error}
          summary={summary}
          isSummaryLoading={isSummaryLoading}
          onImageSelect={handleImageSelect}
          onAnalysis={handleAnalysis}
          onAnswerChange={handleAnswerChange}
        />
      ) : page === 'results' ? (
        <ResultsPage
          analysisResult={analysisResult}
          imageUrl={imageUrl}
          summary={summary}
          isSummaryLoading={isSummaryLoading}
          onNewAnalysis={() => {
            setPage('analysis');
            setAnalysisResult(null);
            setSummary(null);
            setError(null);
          }}
          onGoToChat={() => setPage('chat')}
        />
      ) : (
        <ChatPage 
          analysisResult={analysisResult}
          messages={chatMessages}
          isLoading={isChatLoading}
          error={chatError}
          onSendMessage={handleSendMessage}
          askedQuestions={askedQuestions}
          modelStatus={modelStatus}
          activeModelName={getActiveModelName()}
          onLoadModel={handleLoadModel}
          modelProgress={modelProgress}
          modelProgressText={modelProgressText}
        />
      )}

      {/* Sabit Chatbot Butonu */}
      <div className="chatbot-float">
        <button 
          className="chatbot-btn"
          onClick={() => setPage('chat')}
          title="AI Sohbet"
        >
          💬
        </button>
      </div>
    </div>
  );
};

export default App;