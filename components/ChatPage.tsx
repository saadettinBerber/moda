import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ChatMessage, AnalysisResult } from '../types';
import { determineKibbeType } from '../utils/kibbe';


interface ChatPageProps {
  analysisResult: AnalysisResult | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  askedQuestions: Set<string>;
  modelStatus: 'loading' | 'ready' | 'error' | 'none';
  activeModelName: string | null;
  onLoadModel: () => void;
  modelProgress: number;
  modelProgressText: string;
}

const ChatPage: React.FC<ChatPageProps> = ({
  analysisResult,
  messages,
  isLoading,
  error,
  onSendMessage,
  askedQuestions,
  modelStatus,
  activeModelName,
  onLoadModel,
  modelProgress,
  modelProgressText
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showReadyNotification, setShowReadyNotification] = useState(false);
  const [prevModelStatus, setPrevModelStatus] = useState<'loading' | 'ready' | 'error' | 'none'>('none');

  // Debug için
  console.log('ChatPage render - modelStatus:', modelStatus, 'isChatOpen:', isChatOpen);

  const suggestedQuestions = useMemo(() => {
    if (analysisResult && Object.keys(analysisResult).length > 0) {
      const kibbeType = determineKibbeType(analysisResult);
      if (kibbeType !== "Karışık (Belirgin Bir Tip Bulunamadı)") {
        return [
          `Gardırop temelleri: ${kibbeType}`,
          `Hangi kumaşlar bana yakışır? (${kibbeType})`,
          `Aksesuar önerileri: ${kibbeType}`,
          `Kaçınmam gerekenler: ${kibbeType}`,
        ];
      }
    }
    return [
      "'Dramatic' vücut tipi nedir?",
      "Gardırop temelleri: Classic",
      "Farklı kumaş türlerini açıkla",
      "Moda sözlüğü: Silüet",
    ];
  }, [analysisResult]);

  const availableSuggestions = useMemo(() => {
    return suggestedQuestions.filter(q => !askedQuestions.has(q));
  }, [suggestedQuestions, askedQuestions]);


  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages, isLoading]);

  // Model durumu değişikliklerini takip et
  useEffect(() => {
    if (modelStatus === 'ready' && prevModelStatus === 'loading' && activeModelName) {
      setShowSuggestions(true);
      setShowReadyNotification(true);

      // 5 saniye sonra bildirimi gizle
      const timer = setTimeout(() => {
        setShowReadyNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
    setPrevModelStatus(modelStatus);
  }, [modelStatus, activeModelName, prevModelStatus]);

  const handleLocalSendMessage = (messageContent: string) => {
    const trimmedContent = messageContent.trim();
    if (!trimmedContent || isLoading) {
      return;
    }

    setShowSuggestions(false);
    onSendMessage(trimmedContent);
    setInput('');
    // Re-show suggestions after response
    const timer = setTimeout(() => setShowSuggestions(true), 1000);
    return () => clearTimeout(timer);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLocalSendMessage(input);
  }

  const handleSuggestionClick = (question: string) => {
    handleLocalSendMessage(question);
  };


  const BotAvatar = () => (
    <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden shadow-md">
      <img
        src="https://storage.googleapis.com/aistudio-hosting/workspace-dev/ba120760-4966-4148-89c0-8260b45ab5cb/prompt-assets/image-1.png"
        alt="AI Stil Danışmanı"
        className="w-full h-full object-cover"
      />
    </div>
  );

  const UserAvatar = () => (
    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );

  const renderStatusBadge = () => {
    if (modelStatus === 'ready' && activeModelName) {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 shadow-sm">
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Akıllı asistan hazır ({activeModelName})</span>
        </div>
      );
    }

    if (modelStatus === 'loading') {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
          <span className="inline-flex h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></span>
          <span>Akıllı asistan hazırlanıyor...</span>
        </div>
      );
    }

    if (modelStatus === 'error') {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm">
          <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Chat hizmeti şu anda kullanılamıyor.</span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
        <span className="inline-flex h-2 w-2 rounded-full bg-gray-400 animate-pulse"></span>
        <span>Model başlatılıyor...</span>
      </div>
    );
  };

  const renderReadyNotification = () => {
    if (!showReadyNotification) return null;

    return (
      <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-sm text-green-700 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-2xl">🎉</span>
          </div>
          <div>
            <div className="font-semibold">Akıllı asistan hazır!</div>
            <div className="text-xs text-green-600 mt-1">
              {activeModelName} modeli başarıyla yüklendi. Artık sohbet edebilirsiniz!
            </div>
          </div>
          <button
            onClick={() => setShowReadyNotification(false)}
            className="ml-2 text-green-500 hover:text-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderStatusBanner = () => {
    if (modelStatus === 'loading') {
      return (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm text-blue-700 shadow-sm">
          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></span>
          <span>Akıllı asistan modeli yükleniyor... Bu işlem 2-3 dakika sürebilir.</span>
        </div>
      );
    }

    if (modelStatus === 'ready' && activeModelName) {
      return (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-700 shadow-sm">
          <span className="inline-flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
          <span>🎉 Akıllı asistan hizmetinize hazır! ({activeModelName} - Tamamen çevrimdışı)</span>
        </div>
      );
    }

    if (modelStatus === 'error') {
      return (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
            <span>❌ Akıllı asistan modeli yüklenemedi</span>
          </div>
          <div className="text-xs text-red-600 ml-6">
            Tarayıcı console'unu (F12) açarak detaylı hata mesajını görebilirsiniz.
            <br />
            Çözüm önerileri: Sayfayı yenileyin, farklı tarayıcı deneyin veya internet bağlantınızı kontrol edin.
          </div>
        </div>
      );
    }

    if (modelStatus === 'none') {
      return (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-700 shadow-sm">
          <span className="inline-flex h-3 w-3 rounded-full bg-gray-400 animate-pulse"></span>
          <span>Model başlatılıyor...</span>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="relative h-[calc(100vh-88px)] overflow-hidden bg-gradient-to-br from-[#f6f0ff] via-white to-[#fdf2ff] text-gray-800">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl"></div>
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl"></div>

      {/* Model hazır bildirimi */}
      {renderReadyNotification()}

      <div className="relative z-10 flex h-full w-full justify-center px-4 py-10">
        <div className="flex h-full w-full max-w-5xl flex-col">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-600 shadow-sm">
              Moda RAG
            </span>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Kişisel stil danışmanınız burada</h1>
            <p className="mt-2 text-sm text-gray-600">
              RAG destekli moda asistanı, sorularınızı yanıtlamak için hazır. Sohbeti açmak için aşağıdaki parlak butona dokunun.
            </p>
          </div>

          <div className="mt-10 flex flex-1 flex-col">
            {!isChatOpen ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
                {renderStatusBadge()}

                {/* Model yükleme arayüzü */}
                {modelStatus === 'none' && (
                  <div className="relative">
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-3 text-indigo-600 font-semibold drop-shadow-sm">
                      <span className="text-2xl leading-none animate-bounce">⬇️</span>
                      <span>Modeli yükle!</span>
                      <span className="text-2xl leading-none animate-bounce">⬇️</span>
                    </div>
                    <button
                      type="button"
                      onClick={onLoadModel}
                      className="group relative flex w-full max-w-lg items-stretch overflow-hidden rounded-[28px] border border-white/40 px-8 py-7 text-left shadow-[0_30px_60px_rgba(129,140,248,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_38px_75px_rgba(129,140,248,0.45)] focus:outline-none focus:ring-4 focus:ring-indigo-200/60 focus:ring-offset-2 focus:ring-offset-white bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 cursor-pointer"
                    >
                      <span className="pointer-events-none absolute -inset-1 rounded-[32px] bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                      <div className="relative flex w-full items-center justify-between gap-6">
                        <div className="space-y-3">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/90">
                            WebLLM Model
                          </span>
                          <div>
                            <p className="text-2xl font-semibold text-white">AI Modelini Yükle</p>
                            <p className="mt-1 text-sm text-indigo-50/90">
                              Tamamen çevrimdışı çalışan AI modelini yüklemek için tıkla. İlk yükleme 2-3 dakika sürebilir.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-white">
                          <span className="rounded-full border border-white/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em]">
                            Yükle
                          </span>
                          <span className="text-4xl leading-none drop-shadow">📥</span>
                          <span className="text-xs text-indigo-100/90">
                            Model Yükle
                          </span>
                        </div>
                      </div>
                    </button>
                    <div className="mt-6 text-xs text-gray-500">
                      * Model bir kez yüklendikten sonra tamamen çevrimdışı çalışır.
                    </div>
                  </div>
                )}

                {/* Model hatası */}
                {modelStatus === 'error' && (
                  <div className="relative w-full max-w-lg">
                    <div className="rounded-[28px] border border-red-200 bg-red-50 px-8 py-8 shadow-lg">
                      <div className="text-center space-y-4">
                        <div className="text-2xl">❌</div>
                        <h3 className="text-xl font-semibold text-red-900">Model Yüklenemedi</h3>
                        <p className="text-sm text-red-700">WebLLM modeli yüklenirken bir hata oluştu.</p>

                        <div className="text-xs text-red-600 space-y-1">
                          <p>• Tarayıcınızın WebLLM desteklediğinden emin olun</p>
                          <p>• Chrome veya Firefox kullanmayı deneyin</p>
                          <p>• İnternet bağlantınızı kontrol edin</p>
                        </div>

                        <button
                          onClick={onLoadModel}
                          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          Tekrar Dene
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Model yükleniyor */}
                {modelStatus === 'loading' && (
                  <div className="relative w-full max-w-lg">
                    <div className="rounded-[28px] border border-blue-200 bg-blue-50 px-8 py-8 shadow-lg">
                      <div className="text-center space-y-4">
                        <div className="text-2xl">⏳</div>
                        <h3 className="text-xl font-semibold text-blue-900">Model Yükleniyor</h3>
                        <p className="text-sm text-blue-700">{modelProgressText}</p>

                        {/* Progress Bar */}
                        <div className="w-full bg-blue-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${modelProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-blue-600">{Math.round(modelProgress)}% tamamlandı</p>

                        <div className="text-xs text-blue-600 space-y-1">
                          <p>• Model dosyaları indiriliyor...</p>
                          <p>• Bu işlem 2-3 dakika sürebilir</p>
                          <p>• Lütfen sayfayı kapatmayın</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Model hazır - sohbet başlat */}
                {modelStatus === 'ready' && (
                  <div className="relative">
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-3 text-indigo-600 font-semibold drop-shadow-sm">
                      <span className="text-2xl leading-none animate-bounce">⬇️</span>
                      <span>Sohbet başlat!</span>
                      <span className="text-2xl leading-none animate-bounce">⬇️</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="group relative flex w-full max-w-lg items-stretch overflow-hidden rounded-[28px] border border-white/40 px-8 py-7 text-left shadow-[0_30px_60px_rgba(129,140,248,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_38px_75px_rgba(129,140,248,0.45)] focus:outline-none focus:ring-4 focus:ring-indigo-200/60 focus:ring-offset-2 focus:ring-offset-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 cursor-pointer"
                    >
                      <span className="pointer-events-none absolute -inset-1 rounded-[32px] bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                      <div className="relative flex w-full items-center justify-between gap-6">
                        <div className="space-y-3">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/90">
                            Kişisel destek
                          </span>
                          <div>
                            <p className="text-2xl font-semibold text-white">WebLLM Hazır! 🚀</p>
                            <p className="mt-1 text-sm text-indigo-50/90">
                              Tamamen çevrimdışı AI ile moda sorularını sorabilirsin!
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-white">
                          <span className="rounded-full border border-white/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em]">
                            Başlat
                          </span>
                          <span className="text-4xl leading-none drop-shadow">💬</span>
                          <span className="text-xs text-indigo-100/90">
                            Sohbeti aç
                          </span>
                        </div>
                      </div>
                    </button>
                    <div className="mt-6 text-xs text-gray-500">
                      * RAG (Retrieval-Augmented Generation) destekli moda sohbeti ile kişisel öneriler alın.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500">Moda RAG Sohbeti</span>
                    <h2 className="mt-2 text-2xl font-semibold text-gray-900">Kişisel desteğin burada</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Stil danışmanına sorularını yönelt, anında yanıt al.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(false)}
                    className="inline-flex items-center gap-2 self-start rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm transition hover:bg-indigo-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Sohbeti gizle
                  </button>
                </div>

                <div className="mt-4">{renderStatusBanner()}</div>

                <div className="mt-6 flex flex-1 flex-col overflow-hidden rounded-[28px] border border-indigo-100 bg-white/85 shadow-[0_30px_60px_rgba(99,102,241,0.13)] backdrop-blur">
                  <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <BotAvatar />}
                        <div
                          className={`max-w-2xl rounded-2xl px-5 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-50 text-indigo-900 shadow-inner' : 'bg-white text-gray-800 shadow-md'}`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && <UserAvatar />}
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex items-start gap-4 justify-start">
                        <BotAvatar />
                        <div className="max-w-xl rounded-2xl bg-white px-5 py-3 shadow-md">
                          <div className="flex items-center justify-center space-x-1.5">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t border-indigo-50 bg-white/90 px-6 py-5">
                    {showSuggestions && !isLoading && availableSuggestions.length > 0 && (
                      <div className="mb-4 flex flex-wrap justify-center gap-2">
                        {availableSuggestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(q)}
                            className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-1 focus:ring-offset-white"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="relative flex items-end gap-3">
                      <div className="relative flex-1">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit(e as any);
                            }
                          }}
                          placeholder="Moda sorunu buraya yaz... (API ile hızlı yanıt)"
                          aria-label="Chat message"
                          className="w-full resize-none rounded-2xl border border-indigo-100 bg-white text-gray-700 px-5 py-4 pr-16 text-sm shadow-inner transition-all focus:outline-none focus:ring-4 focus:border-indigo-300 focus:ring-indigo-100"
                          rows={1}
                          disabled={isLoading}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                        aria-label="Send message"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                        </button>
                    </form>

                    {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChatPage;
