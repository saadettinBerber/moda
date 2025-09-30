import React, { useEffect, useMemo, useRef, useState } from 'react';
import './styleguide.css';
import { sections } from './constants';
import type { AnalysisResult, ChatMessage, Section } from './types';
import { analyzeImageWithGemini, getChatbotResponse, getStyleSummary } from './services/geminiService';
import { createLocalSummary, getAnalysisInsights, getStyleRecommendations } from './utils/kibbe';
import { modelManager } from './services/modelManager';

type AnswerMap = Record<string, string>;

type UploadStatus = 'idle' | 'analyzing' | 'success' | 'error';
type View = 'analysis' | 'results';
type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

type SummaryState = {
  kibbeType: string;
  description: string;
  palette: string;
};

const buildBlankAnswers = (): AnswerMap => {
  const map: AnswerMap = {};
  sections.forEach((section) => {
    section.questions.forEach((question) => {
      map[question.id] = '';
    });
  });
  return map;
};

const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Görsel dönüştürülemedi.'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Görsel okunurken bir hata oluştu.'));
  });

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    role: 'model',
    content: 'Merhaba, ben Kibbe Asistanı. Yerel modeli indirmek için “Locale modeli indir” butonuna dokun – indirme tamamlandığında stil sorularına yanıt vermeye hazırım!'
  }
];

interface NavBarProps {
  activeView: View;
  onNavigate: (view: View | 'guidance') => void;
  resultsReady: boolean;
}

const TopNavigation: React.FC<NavBarProps> = ({ activeView, onNavigate, resultsReady }) => {
  const navItems: Array<{ id: View | 'guidance'; label: string; disabled?: boolean }> = [
    { id: 'analysis', label: 'Anket' },
    { id: 'results', label: 'Sonuçlar', disabled: !resultsReady },
    { id: 'guidance', label: 'Öneriler', disabled: !resultsReady }
  ];

  return (
    <header className="app-shell__header">
      <div className="app-shell__brand">
        <span className="app-shell__logo" aria-hidden>✨</span>
        <div>
          <span className="app-shell__title">Kibbe Sistemi</span>
          <span className="app-shell__subtitle">Stil Analiz Asistanı</span>
        </div>
      </div>
      <nav className="app-shell__nav" aria-label="Sayfa gezinimi">
        {navItems.map((item) => {
          const isActive = item.id === activeView;
          return (
            <button
              key={item.id}
              type="button"
              className={`app-shell__nav-link${isActive ? ' is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
              disabled={item.disabled}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

const sectionGradients: Record<string, string> = {
  I: 'linear-gradient(120deg, #a855f7, #6366f1)',
  II: 'linear-gradient(120deg, #ec4899, #f97316)',
  III: 'linear-gradient(120deg, #22d3ee, #3b82f6)',
  IV: 'linear-gradient(120deg, #10b981, #14b8a6)',
  V: 'linear-gradient(120deg, #f59e0b, #f97316)'
};

interface AccordionProps {
  section: Section;
  answers: AnswerMap;
  isOpen: boolean;
  onToggle: () => void;
  onAnswerChange: (questionId: string, optionId: string) => void;
}

const SectionAccordion: React.FC<AccordionProps> = ({ section, answers, isOpen, onToggle, onAnswerChange }) => {
  const answeredCount = section.questions.filter((question) => Boolean(answers[question.id])).length;
  const progress = Math.round((answeredCount / section.questions.length) * 100) || 0;
  const accentStyle = {
    '--accordion-accent': sectionGradients[section.id] ?? sectionGradients.I
  } as React.CSSProperties;
  const contentId = `section-${section.id}`;

  return (
    <article className={`accordion${isOpen ? ' is-open' : ''}`} style={accentStyle}>
      <button
        type="button"
        className="accordion__header"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="accordion__meta">
          <span className="accordion__badge">Bölüm {section.id}</span>
          <h3>{section.title}</h3>
          <p className="accordion__hint">
            {answeredCount}/{section.questions.length} soru yanıtlandı
          </p>
          <div className="accordion__progress-bar" aria-hidden>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="accordion__status">
          <span className="accordion__status-chip" aria-label={`Tamamlanan soru: ${answeredCount}`}>
            %{progress}
          </span>
          <span className="accordion__chevron" aria-hidden>{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>
      {isOpen ? (
        <div className="accordion__content" id={contentId}>
          {section.questions.map((question) => (
            <fieldset key={question.id} className="question">
              <legend className="question__title">
                <span>{question.id}</span>
                <p>{question.text}</p>
              </legend>
              <div className="question__options">
                {question.options.map((option) => {
                  const inputId = `${question.id}-${option.id}`;
                  const isActive = answers[question.id] === option.id;
                  return (
                    <label
                      key={option.id}
                      htmlFor={inputId}
                      className={`question__option${isActive ? ' is-active' : ''}`}
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={isActive}
                        onChange={() => onAnswerChange(question.id, option.id)}
                      />
                      <span className="question__option-id">{option.id.toUpperCase()}</span>
                      <span className="question__option-text">{option.text}</span>
                      {option.subtext ? <span className="question__option-sub">{option.subtext}</span> : null}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}
    </article>
  );
};

interface AnalysisViewProps {
  answers: AnswerMap;
  onAnswerChange: (questionId: string, optionId: string) => void;
  onSelectFile: () => void;
  onComplete: () => void;
  onReset: () => void;
  onRetry: () => void;
  uploadStatus: UploadStatus;
  statusMessage: string | null;
  previewUrl: string | null;
  formError: string | null;
  autoFilled: boolean;
  answeredCount: number;
  totalCount: number;
  usesCpuRuntime: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({
  answers,
  onAnswerChange,
  onSelectFile,
  onComplete,
  onReset,
  onRetry,
  uploadStatus,
  statusMessage,
  previewUrl,
  formError,
  autoFilled,
  answeredCount,
  totalCount,
  usesCpuRuntime,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((section) => {
      initial[section.id] = section.id === 'I';
    });
    return initial;
  });

  useEffect(() => {
    if (autoFilled) {
      setOpenSections((prev) => {
        const next: Record<string, boolean> = {};
        sections.forEach((section, index) => {
          next[section.id] = index === 0;
        });
        return next;
      });
    }
  }, [autoFilled]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const isCurrentlyOpen = Boolean(prev[id]);
      const next: Record<string, boolean> = {};
      sections.forEach((section) => {
        next[section.id] = false;
      });
      next[id] = !isCurrentlyOpen;
      return next;
    });
  };

  const allAnswered = answeredCount === totalCount;

  return (
    <div className="analysis-view">
      <section className="analysis-hero">
        <div className="analysis-hero__intro">
          <h1>Kibbe Sistemi Analiz Anketi</h1>
          <p>Kendi stil kimliğini keşfedip gardırobunu dönüştürmek için yapay zeka destekli soruları yanıtla.</p>
        </div>
        <div className="analysis-hero__card">
          <div className="analysis-hero__upload">
            <div className={`upload-panel${previewUrl ? ' has-image' : ''}`}>
              {previewUrl ? (
                <img src={previewUrl} alt="Yüklenen fotoğraf önizlemesi" />
              ) : (
                <div className="upload-panel__placeholder">
                  <span aria-hidden>📸</span>
                  <p>Fotoğrafınızı yükleyin</p>
                  <small>Gemini 2.5 Flash soruları otomatik olarak senin için dolduracak.</small>
                </div>
              )}
            </div>
            <div className="analysis-hero__actions">
              <button type="button" className="button button--primary" onClick={onSelectFile}>
                {uploadStatus === 'error' ? 'Başka Fotoğraf Seç' : 'Fotoğraf Yükle'}
              </button>
              {previewUrl ? (
                <button type="button" className="button button--ghost" onClick={onReset}>
                  Analizi Sıfırla
                </button>
              ) : null}
              {uploadStatus === 'error' && previewUrl ? (
                <button type="button" className="button button--outline" onClick={onRetry}>
                  Tekrar Dene
                </button>
              ) : null}
            </div>
          </div>
          <div className="analysis-hero__status">
            <span className="status-badge">Yapay Zeka ile Hızlan!</span>
            <p>
              Fotoğrafını yüklediğinde soruların büyük kısmını Gemini otomatik doldurur. Tüm yanıtları gözden geçirip
              sana uygun olduğundan emin olabilirsin.
            </p>
            <ul>
              <li>1. Fotoğrafını yükle ve temel analiz başlasın.</li>
              <li>2. Otomatik doldurulan cevapları incele, gerekirse düzenle.</li>
              <li>3. Analizi tamamla ve kişiselleştirilmiş Kibbe rehberini keşfet.</li>
            </ul>
            {usesCpuRuntime ? (
              <div className="analysis-hero__alert analysis-hero__alert--info">Sohbet asistanı CPU modunda çalışıyor. Yanıtlar WebGPU'ya göre biraz daha yavaş olabilir.</div>
            ) : null}
            {statusMessage ? (
              <div className={`analysis-hero__alert analysis-hero__alert--${uploadStatus}`} role="status">
                {statusMessage}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="analysis-sections">
        {sections.map((section) => (
          <SectionAccordion
            key={section.id}
            section={section}
            answers={answers}
            isOpen={Boolean(openSections[section.id])}
            onToggle={() => toggleSection(section.id)}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </section>

      <section className="analysis-callout">
        <div className="analysis-callout__content">
          <div>
            <h2>Analizi Tamamla</h2>
            <p>Yanıtlarının tamamını onayla ve kişisel Kibbe raporunu görüntüle.</p>
            <p className="analysis-callout__counter">{answeredCount}/{totalCount} soru yanıtlandı</p>
            {formError ? <p className="analysis-callout__error">{formError}</p> : null}
          </div>
          <button
            type="button"
            className="button button--glow"
            onClick={onComplete}
            disabled={!allAnswered}
          >
            Analizi Tamamla
          </button>
        </div>
      </section>
    </div>
  );
};

interface ResultsViewProps {
  summary: SummaryState | null;
  remoteSummary: string | null;
  remoteSummaryStatus: 'idle' | 'loading' | 'error';
  remoteSummaryError: string | null;
  analysisResult: AnalysisResult | null;
  previewUrl: string | null;
  onEdit: () => void;
  guidanceRef: React.RefObject<HTMLDivElement>;
}

const ResultsView: React.FC<ResultsViewProps> = ({
  summary,
  remoteSummary,
  remoteSummaryStatus,
  remoteSummaryError,
  analysisResult,
  previewUrl,
  onEdit,
  guidanceRef,
}) => {
  const insights = useMemo(() => (analysisResult ? getAnalysisInsights(analysisResult) : []), [analysisResult]);
  const kibbeType = summary?.kibbeType ?? 'Kibbe Tipin';
  const recommendations = useMemo(() => getStyleRecommendations(summary?.kibbeType ?? ''), [summary?.kibbeType]);
  const finalSummary = remoteSummary?.trim() || summary?.description || 'Analiz özeti hazırlanıyor.';

  return (
    <div className="results-view">
      <section className="results-hero">
        <header className="results-hero__header">
          <div>
            <h1>Kibbe Vücut Tipi Analiz Sonucunuz</h1>
            <p>Analizini kaydet, yazdır veya arkadaşlarınla paylaş.</p>
          </div>
          <button type="button" className="button button--ghost" onClick={onEdit}>
            Yanıtları Düzenle
          </button>
        </header>

        <div className="results-card">
          <div className="results-card__visual">
            {previewUrl ? (
              <img src={previewUrl} alt="Analiz edilen kişinin fotoğrafı" />
            ) : (
              <div className="results-card__placeholder">👤</div>
            )}
          </div>
          <div className="results-card__body">
            <span className="results-card__badge">Sizin Tipiniz</span>
            <h2>{kibbeType}</h2>
            <p>{finalSummary}</p>
            {remoteSummaryStatus === 'loading' ? (
              <div className="results-card__loading" aria-live="polite">
                Yapay zeka özeti hazırlanıyor...
              </div>
            ) : null}
            {remoteSummaryError ? (
              <div className="results-card__error">{remoteSummaryError}</div>
            ) : null}
            {summary ? (
              <div className="results-card__palette">
                <span>Renk Paleti Önerisi:</span>
                <p>{summary.palette}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="results-grid">
        <div className="results-panel">
          <div className="results-panel__header">
            <h3>Yapay Zeka Analizi</h3>
            <p>Fotoğrafından çıkarılan ana yapısal öngörüler.</p>
          </div>
          <div className="insight-grid">
            {insights.map((item) => (
              <div key={item.label} className="insight">
                <span className="insight__label">{item.label}</span>
                <p>{item.value}</p>
              </div>
            ))}
            {!analysisResult ? (
              <p className="insight__empty">Analizi tamamladığında detaylar burada yer alır.</p>
            ) : null}
          </div>
        </div>

        <div className="results-panel" ref={guidanceRef}>
          <div className="results-panel__header">
            <h3>Stil Önerileri</h3>
            <p>Kibbe tipine uygun kombin fikirleri.</p>
          </div>
          <div className="guidance">
            <div className="guidance__group">
              <h4>Giyim Önerileri</h4>
              <ul>
                {recommendations.clothing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="guidance__group">
              <h4>Saç ve Makyaj Tavsiyeleri</h4>
              <ul>
                {recommendations.hairMakeup.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="results-actions">
        <button type="button" className="button button--primary" onClick={() => window.print()}>
          Yazdır
        </button>
        <button type="button" className="button button--glow" onClick={() => alert('Yakında!')}>
          Sonuçları Kaydet
        </button>
        <button type="button" className="button button--outline" onClick={() => alert('Paylaşım yakında!')}>
          Paylaş
        </button>
      </section>
    </div>
  );
};

interface AssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  modelStatus: ModelStatus;
  modelProgress: number;
  modelProgressText: string;
  onLoadModel: () => void;
  chatError: string | null;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  usesCpuRuntime: boolean;
}

const FloatingAssistant: React.FC<AssistantProps> = ({
  isOpen,
  onToggle,
  messages,
  inputValue,
  onInputChange,
  onSend,
  isSending,
  modelStatus,
  modelProgress,
  modelProgressText,
  onLoadModel,
  chatError,
  suggestions,
  onSuggestionClick,
  usesCpuRuntime,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [isOpen, messages, isSending]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const statusLabel = (() => {
    if (usesCpuRuntime) {
      if (modelStatus === 'ready') return 'CPU modeli hazır';
      if (modelStatus === 'loading') return 'CPU modeli indiriliyor...';
      if (modelStatus === 'error') return 'CPU modeli hatası';
      return 'CPU modelini indirmek için hazırlık yapılıyor.';
    }
    return {
      idle: 'Model indirilmedi',
      loading: 'Model indiriliyor...',
      ready: 'Model hazır',
      error: 'Model hatası'
    }[modelStatus];
  })();

  return (
    <div className={`assistant${isOpen ? ' is-open' : ''}`}>
      <button type="button" className="assistant__toggle" onClick={onToggle} aria-label="Kibbe asistanını aç">
        💬
      </button>
      {isOpen ? (
        <div className="assistant__panel" role="dialog" aria-label="Kibbe Asistanı">
          <header className="assistant__header">
            <div>
              <h2>Kibbe Asistanı</h2>
              <p>{statusLabel}</p>
            </div>
            <button type="button" onClick={onToggle} aria-label="Asistanı kapat" className="assistant__close">×</button>
          </header>
          <div className="assistant__status">
            {modelStatus !== 'ready' ? (
              <button type="button" className="button button--primary" onClick={onLoadModel} disabled={modelStatus === 'loading'}>
                {usesCpuRuntime ? 'CPU modeli indir' : 'Locale modeli indir'}
              </button>
            ) : (
              <span className="assistant__ready">{usesCpuRuntime ? 'CPU modeli hazır' : 'Model hazır'} • %{modelProgress}</span>
            )}
            <span className="assistant__progress-text">{modelProgressText}</span>
          </div>

          {suggestions.length > 0 ? (
            <div className="assistant__suggestions">
              <span>Sıkça sorulan sorular</span>
              <div>
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => onSuggestionClick(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="assistant__messages" ref={bodyRef}>
            {messages.map((message, index) => (
              <div key={`msg-${index}`} className={`assistant__message assistant__message--${message.role}`}>
                <p>{message.content}</p>
              </div>
            ))}
            {isSending ? (
              <div className="assistant__message assistant__message--model assistant__typing">
                <span />
                <span />
                <span />
              </div>
            ) : null}
          </div>

          {chatError ? <div className="assistant__error">{chatError}</div> : null}

          <form
            className="assistant__composer"
            onSubmit={(event) => {
              event.preventDefault();
              onSend();
            }}
          >
            <textarea
              ref={textareaRef}
              placeholder="Örn. Soft Dramatic için hangi kumaşları seçmeliyim?"
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
              rows={1}
              disabled={modelStatus !== 'ready'}
            />
            <button type="submit" disabled={!inputValue.trim() || isSending || modelStatus !== 'ready'}>
              Gönder
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
};

const StyleGuideApp: React.FC = () => {
  const [answers, setAnswers] = useState<AnswerMap>(() => buildBlankAnswers());
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [localSummary, setLocalSummary] = useState<SummaryState | null>(null);
  const [view, setView] = useState<View>('analysis');
  const [formError, setFormError] = useState<string | null>(null);

  const [remoteSummary, setRemoteSummary] = useState<string | null>(null);
  const [remoteSummaryStatus, setRemoteSummaryStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [remoteSummaryError, setRemoteSummaryError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle');
  const [modelProgress, setModelProgress] = useState(0);
  const [modelProgressText, setModelProgressText] = useState('Model henüz indirilmedi.');

  const [pendingScroll, setPendingScroll] = useState<'guidance' | null>(null);
  const guidanceRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasWebGpuApi = typeof navigator !== 'undefined' && 'gpu' in navigator;
  const [usesCpuRuntime, setUsesCpuRuntime] = useState(!hasWebGpuApi);

  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);
  const totalCount = useMemo(() => sections.reduce((acc, section) => acc + section.questions.length, 0), []);
  const resultsReady = Boolean(analysisResult);

  useEffect(() => {
    if (pendingScroll === 'guidance' && view === 'results' && guidanceRef.current) {
      guidanceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingScroll(null);
    }
  }, [pendingScroll, view]);

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    if (modelStatus === 'ready') {
      setChatMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'model' && lastMessage.content.includes('hazır')) {
          return prev;
        }
        return [
          ...prev,
          {
            role: 'model',
            content: 'Model başarıyla yüklendi! Stil sorularını bekliyorum. Analiz sonuçlarını paylaşırsan daha kişisel öneriler verebilirim.'
          }
        ];
      });
    }
  }, [modelStatus]);

  const suggestionChips = useMemo(() => {
    if (!analysisResult || !localSummary) {
      return [
        'Kibbe sisteminde Dramatic ne anlama geliyor?',
        'Gardırobumu nasıl yapılandırmalıyım?',
        'Aksesuar seçimlerimde nelere dikkat etmeliyim?'
      ];
    }

    const kibbeType = localSummary.kibbeType;
    return [
      `${kibbeType} için günlük kombin önerisi verir misin?`,
      `${kibbeType} tipleri için hangi kumaşlar ideal?`,
      `${kibbeType} vücut tipinin kaçınması gereken detaylar neler?`
    ];
  }, [analysisResult, localSummary]);

  const resetAll = () => {
    setAnswers(buildBlankAnswers());
    setUploadStatus('idle');
    setStatusMessage(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setAutoFilled(false);
    setLastUploadedFile(null);
    setAnalysisResult(null);
    setLocalSummary(null);
    setRemoteSummary(null);
    setRemoteSummaryStatus('idle');
    setRemoteSummaryError(null);
    setFormError(null);
    setView('analysis');
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setChatInput('');
    setChatError(null);
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleAutoFill = async (file: File) => {
    setUploadStatus('analyzing');
    setStatusMessage('Gemini 2.5 Flash cevapları hazırlıyor...');
    setAutoFilled(false);
    setLastUploadedFile(null);
    setAnalysisResult(null);
    setLocalSummary(null);

    try {
      const base64 = await readFileAsBase64(file);
      const result = await analyzeImageWithGemini(base64, file.type);
      const updated = buildBlankAnswers();
      Object.entries(result).forEach(([questionId, optionId]) => {
        if (questionId in updated) {
          updated[questionId] = optionId;
        }
      });
      setAnswers(updated);
      setAutoFilled(true);
      setUploadStatus('success');
      setStatusMessage('Sorular otomatik dolduruldu. Yanıtları kontrol edip düzenleyebilirsin.');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Analiz sırasında beklenmedik bir hata oluştu.';
      setUploadStatus('error');
      setStatusMessage(message);
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadStatus('error');
      setStatusMessage('Lütfen bir görsel dosyası seçin.');
      return;
    }

    setLastUploadedFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    void handleAutoFill(file);
  };

  const handleRetry = () => {
    if (!lastUploadedFile) {
      setStatusMessage('Yeni bir fotoğraf seçmelisin.');
      return;
    }
    setStatusMessage('Yeniden analiz ediliyor...');
    setUploadStatus('analyzing');
    void handleAutoFill(lastUploadedFile);
  };

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleCompleteAnalysis = () => {
    if (answeredCount !== totalCount) {
      setFormError('Analizi tamamlamadan önce tüm soruları yanıtlaman gerekir.');
      return;
    }

    const snapshot: AnalysisResult = { ...answers };
    setAnalysisResult(snapshot);
    const summary = createLocalSummary(snapshot);
    setLocalSummary(summary);
    setView('results');
    setFormError(null);

    setRemoteSummaryStatus('loading');
    setRemoteSummary(null);
    setRemoteSummaryError(null);
    getStyleSummary(snapshot)
      .then((result) => {
        setRemoteSummary(result ?? 'Stil özeti oluşturulamadı, yerel öneriyi kullanabilirsin.');
        setRemoteSummaryStatus('idle');
      })
      .catch((error) => {
        console.error('Summary error', error);
        setRemoteSummaryStatus('error');
        setRemoteSummaryError('Stil özeti alınamadı. Yerel önerileri kullanmaya devam edebilirsin.');
      });
  };

  const handleNavigate = (target: View | 'guidance') => {
    if (target === 'analysis') {
      setView('analysis');
      return;
    }

    if (!analysisResult) {
      setFormError('Önce analizi tamamlamalısın.');
      return;
    }

    setView('results');
    if (target === 'guidance') {
      setPendingScroll('guidance');
    }
  };

  const handleLoadModel = async () => {
    if (modelStatus === 'loading') return;
    setModelStatus('loading');
    setModelProgress(0);
    setModelProgressText(usesCpuRuntime ? 'CPU modeli indirilmeye hazırlanıyor...' : 'Model indirilmeye hazırlanıyor...');
    setChatError(null);

    try {
      await modelManager.initializeModel(undefined, ({ progress, text }) => {
        setModelProgress(Math.round(progress * 100));
        setModelProgressText(text || 'Model indiriliyor...');
      });
      setModelStatus('ready');
      setModelProgress(100);
      const runtime = modelManager.getActiveModelRuntime();
      const cpuMode = runtime !== 'webgpu';
      setUsesCpuRuntime(cpuMode);
      setModelProgressText(cpuMode ? 'CPU modeli hazır!' : 'Model hazır!');
    } catch (error) {
      console.error('Model yükleme hatası', error);
      setModelStatus('error');
      const message = error instanceof Error ? error.message : 'Model yüklenemedi.';
      setChatError(message);
      setModelProgressText(message);
      if (message.toLowerCase().includes('cpu')) {
        setUsesCpuRuntime(true);
      }
    }
  };

  const handleSendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isChatLoading) {
      return;
    }

    if (modelStatus !== 'ready') {
      setChatError('Model hazır olmadan mesaj gönderemezsin. Lütfen modeli indir.');
      return;
    }

    const nextMessage: ChatMessage = { role: 'user', content: trimmed };
    setChatMessages((prev) => [...prev, nextMessage]);
    setChatInput('');
    setIsChatLoading(true);
    setChatError(null);

    try {
      const response = await getChatbotResponse(trimmed, analysisResult);
      setChatMessages((prev) => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Sohbet sırasında bilinmeyen bir hata oluştu.';
      setChatError(message);
      setChatMessages((prev) => [...prev, { role: 'model', content: `Üzgünüm, bir hata oluştu: ${message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <TopNavigation activeView={view} onNavigate={handleNavigate} resultsReady={resultsReady} />

      <main className="app-shell__content">
        {view === 'analysis' ? (
          <AnalysisView
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSelectFile={handleSelectFile}
            onComplete={handleCompleteAnalysis}
            onReset={resetAll}
            onRetry={handleRetry}
            uploadStatus={uploadStatus}
            statusMessage={statusMessage}
            previewUrl={previewUrl}
            formError={formError}
            autoFilled={autoFilled}
            answeredCount={answeredCount}
            totalCount={totalCount}
            usesCpuRuntime={usesCpuRuntime}
          />
        ) : (
          <ResultsView
            summary={localSummary}
            remoteSummary={remoteSummary}
            remoteSummaryStatus={remoteSummaryStatus}
            remoteSummaryError={remoteSummaryError}
            analysisResult={analysisResult}
            previewUrl={previewUrl}
            onEdit={() => setView('analysis')}
            guidanceRef={guidanceRef}
          />
        )}
      </main>

      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

      <FloatingAssistant
        isOpen={isAssistantOpen}
        onToggle={() => setIsAssistantOpen((prev) => !prev)}
        messages={chatMessages}
        inputValue={chatInput}
        onInputChange={setChatInput}
        onSend={handleSendMessage}
        isSending={isChatLoading}
        modelStatus={modelStatus}
        modelProgress={modelProgress}
        modelProgressText={modelProgressText}
        onLoadModel={handleLoadModel}
        chatError={chatError}
        suggestions={suggestionChips}
        usesCpuRuntime={usesCpuRuntime}
        onSuggestionClick={(suggestion) => {
          setChatInput(suggestion);
          setIsAssistantOpen(true);
        }}
      />
    </div>
  );
};

export default StyleGuideApp;
