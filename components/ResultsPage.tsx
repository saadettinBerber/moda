import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { determineKibbeType } from '../utils/kibbe';
import type { AnalysisResult } from '../types';
import { sections } from '../constants';
import './ResultsPage.css';

interface ResultsPageProps {
  initialResult?: AnalysisResult | null;
}

const highlightQuestions = [
  { id: 'I.1', label: 'Dikey Çizgi' },
  { id: 'I.2', label: 'Omuz Şekli' },
  { id: 'I.3', label: 'Kol & Bacak' },
  { id: 'I.4', label: 'El & Ayak' },
  { id: 'II.1', label: 'Vücut Şekli' },
  { id: 'IV.3', label: 'Yanaklar' },
];

const gradientPalette = [
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

const ResultsPage: React.FC<ResultsPageProps> = ({ initialResult = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysisResult = (location.state as AnalysisResult | null) ?? initialResult;

  const handleNewAnalysis = () => {
    navigate('/');
  };

  const handleGoToChat = () => {
    console.log('Navigating to chat...');
  };

  if (!analysisResult) {
    return (
      <div className="results-empty">
        <div className="results-empty-card">
          <h1>Henüz bir analiz bulunamadı.</h1>
          <p>Önce fotoğrafını yükleyip analizi tamamla, ardından Sonuçlarım sayfasına dön.</p>
          <button onClick={handleNewAnalysis} className="results-button primary">
            Yeni Analize Başla
          </button>
        </div>
      </div>
    );
  }

  const kibbeType = determineKibbeType(analysisResult);

  const getKibbeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      'Dramatik': 'Dramatik tip; keskin, uzun ve dengeli çizgileriyle dikkat çeker. Stilinde güçlü silüetler ve net hatlar aramalısın.',
      'Yumuşak Dramatik': 'Yumuşak Dramatik, dramatik çizgilere sahip olmakla birlikte yumuşak kıvrımlar barındırır. Feminen detayları güçlü parçalarla dengede tutmak sana iyi gelir.',
      'Doğal': 'Doğal tip, rahat ve serbest bir yapıya sahiptir. Düşük omuz çizgileri ve dengeli silüetler seni en iyi şekilde yansıtır.',
      'Yumuşak Doğal': 'Yumuşak Doğal, doğal çizgileri daha feminen kıvrımlarla birleştirir. Akışkan kumaşlar ve rahat formlar idealdir.',
      'Dengeli': 'Dengeli tip (Klasik), simetrik ve zamansız bir uyuma sahiptir. Net hatlı, zarif parçalar senin stilinin temelini oluşturur.',
      'Yumuşak Dengeli': 'Yumuşak Dengeli (Soft Classic) zarif, simetrik ve hafif yuvarlak detaylarıyla öne çıkar. Akıcı ve detaylı parçalarla uyum yakalarsın.',
      'Teatral Romantik': 'Teatral Romantik; narin, keskin ve çekici detayları bir araya getirir. Gösterişli kumaşlar ve yapılandırılmış parçalar seni vurgular.',
      'Romantik': 'Romantik tip, yumuşak hatları, yuvarlak kıvrımları ve feminen zarafetiyle bilinir. Akışkan kumaşlar ve feminen detaylar stilinin anahtarıdır.',
    };

    return descriptions[type] || 'Bu vücut tipi için henüz özel bir açıklama bulunmuyor, yakında eklenecek!';
  };

  const getStyleRecommendations = (type: string) => {
    const recommendations: Record<string, { clothing: string[]; makeup: string[] }> = {
      Dramatik: {
        clothing: ['Keskin omuzlu ceketler', 'Maksi çizgiler', 'Monokrom kombinler'],
        makeup: ['Belirgin eyeliner', 'Soğuk ton allık', 'Şekilli kaşlar'],
      },
      'Yumuşak Dramatik': {
        clothing: ['Akışkan elbiseler', 'Bel vurgulu üstler', 'İpek gömlekler'],
        makeup: ['Yumuşak kontür', 'Saten rujlar', 'Işıltılı göz makyajı'],
      },
      Doğal: {
        clothing: ['Rahat kesim blazer', 'Düz kesim pantolon', 'Kat kat kombinler'],
        makeup: ['Doğal bronz tonlar', 'Dağınık kaşlar', 'Nemli bitiş'],
      },
      'Yumuşak Doğal': {
        clothing: ['Drape elbiseler', 'Hafif triko', 'Kemerle vurgulanan bel'],
        makeup: ['Pastel göz tonları', 'Işıltılı ten', 'Yumuşak dudak renkleri'],
      },
      Dengeli: {
        clothing: ['Zarif ceketler', 'Kalem etekler', 'Minimalist elbiseler'],
        makeup: ['Simetrik eyeliner', 'Şeftali allık', 'Saten rujlar'],
      },
      'Yumuşak Dengeli': {
        clothing: ['Akıcı midi elbiseler', 'V yaka üstler', 'İnce kemerler'],
        makeup: ['Roz tonlar', 'İpeksi baz', 'Kirpik odağı'],
      },
      'Teatral Romantik': {
        clothing: ['Dantel detaylar', 'Korse formunda üstler', 'Parlak saten kumaşlar'],
        makeup: ['Keskin eyeliner', 'Parlak dudaklar', 'Işıltılı aydınlatıcı'],
      },
      Romantik: {
        clothing: ['Drapeli elbiseler', 'Kıvrımları saran kumaşlar', 'Fırfırlı detaylar'],
        makeup: ['Pembe ton allık', 'Dolgun dudaklar', 'Yumuşak gölgeler'],
      },
    };

    return (
      recommendations[type] || {
        clothing: ['Vücut hatlarını dengeleyen elbiseler', 'Bel vurgulayan parçalar', 'Yumuşak kumaşlar'],
        makeup: ['Doğal ışıltı', 'Belirgin gözler', 'Canlı dudak tonları'],
      }
    );
  };

  const findQuestionDetails = (questionId: string) => {
    for (const section of sections) {
      const question = section.questions.find((q) => q.id === questionId);
      if (question) {
        const answerId = analysisResult[questionId];
        const option = question.options.find((opt) => opt.id === answerId);
        return {
          question,
          option,
        };
      }
    }

    return { question: undefined, option: undefined };
  };

  const styleRecs = getStyleRecommendations(kibbeType);

  return (
    <div className="results-page">
      <section className="results-hero">
        <span className="results-kicker">Kibbe Vücut Tipi Analizi</span>
        <h1>Kibbe Vücut Tipi Analiz Sonucunuz</h1>
        <p>Yapay zekâ analizini gözden geçir, önerileri keşfet ve stil yolculuğunu kişiselleştir.</p>
      </section>

      <section className="results-card">
        <div className="results-visual" aria-hidden>
          <div className="results-visual-frame">
            <span>👤</span>
          </div>
        </div>
        <div className="results-summary">
          <span className="results-chip">Sizin Tipiniz</span>
          <h2>{kibbeType}</h2>
          <p className="results-description">{getKibbeDescription(kibbeType)}</p>

          <div className="results-columns">
            <div>
              <h3>Giyim Önerileri</h3>
              <ul>
                {styleRecs.clothing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Saç ve Makyaj Tavsiyeleri</h3>
              <ul>
                {styleRecs.makeup.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-analysis">
        <div className="ai-analysis-header">
          <h3>Yapay Zeka Analizi</h3>
          <p>Analiz edilen kilit özellikleri kontrol et, gerekirse yanıtlarını güncelle.</p>
        </div>
        <div className="highlight-grid">
          {highlightQuestions.map((highlight, index) => {
            const { question, option } = findQuestionDetails(highlight.id);
            return (
              <div
                key={highlight.id}
                className="highlight-card"
                style={{ background: gradientPalette[index % gradientPalette.length] }}
              >
                <span className="highlight-label">{highlight.label}</span>
                <span className="highlight-answer">{option ? option.text : 'Yanıt bulunamadı'}</span>
                {option?.subtext && <span className="highlight-subtext">{option.subtext}</span>}
                {!option && question && (
                  <span className="highlight-subtext">Bu soruyu tekrar gözden geçir.</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="results-actions">
        <button onClick={handleGoToChat} className="results-button ghost">
          <span>💬</span>
          Sonuçlarını Kaydet
        </button>
        <button onClick={() => window.print()} className="results-button secondary">
          <span>🖨️</span>
          Yazdır
        </button>
        <button onClick={handleNewAnalysis} className="results-button primary">
          <span>🔄</span>
          Yeni Analiz Başlat
        </button>
      </section>
    </div>
  );
};

export default ResultsPage;
