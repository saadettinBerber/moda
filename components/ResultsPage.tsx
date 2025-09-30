import React from 'react';
import { determineKibbeType } from '../utils/kibbe';
import type { AnalysisResult } from '../types';

interface ResultsPageProps {
  analysisResult: AnalysisResult | null;
  imageUrl: string | null;
  summary: string | null;
  isSummaryLoading: boolean;
  onNewAnalysis: () => void;
  onGoToChat: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  analysisResult,
  imageUrl,
  summary,
  isSummaryLoading,
  onNewAnalysis,
  onGoToChat,
}) => {
  if (!analysisResult) {
    return (
      <div className="results-container">
        <div className="text-center">
          <h1>Henüz analiz yapılmamış</h1>
          <button onClick={onNewAnalysis} className="action-btn primary">
            Analiz Yap
          </button>
        </div>
      </div>
    );
  }

  const kibbeType = determineKibbeType(analysisResult);
  
  // Kibbe tipi açıklamaları
  const getKibbeDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      'Dramatik': 'Dramatik vücut tipi, yumuşak hatlar, doğrusal ve feminen bir görünümle karakterizedir. Bu tipteyi bireyler genellikle kısa veya orta boylu olup, belirgin göğüslere, geniş kalçalara ve ince bir bele sahiptir. Romantik vücut tipine sahipseniz, giyim seçimlerinizde vücut hatlarınızı vurgulayan, akışkan kumaşları tercih etmelisiniz. Yumuşak, dokulu etekler, bluzlar ve etekler sizin için idealdir.',
      'Yumuşak Dramatik': 'Yumuşak Dramatik tipi, dramatik ve romantik özelliklerin karışımıdır. Uzun boylu ve açısal yapıya sahip olmakla birlikte, bazı yumuşak detaylar da bulunur.',
      'Doğal': 'Doğal tip, rahat ve serbest bir yapıya sahiptir. Orta boy ve dengeli vücut hatları ile karakterizedir.',
      'Yumuşak Doğal': 'Yumuşak Doğal tip, doğal yapının daha feminen versiyonudur. Hafif kıvrımlı hatlar ve yumuşak detaylar içerir.',
      'Dengeli': 'Dengeli tip, simetrik ve orantılı vücut yapısına sahiptir. Klasik güzellik standartlarını yansıtır.',
      'Yumuşak Dengeli': 'Yumuşak Dengeli tip, dengeli yapının daha feminen versiyonudur. Hafif yumuşak hatlar içerir.',
      'Teatral Romantik': 'Teatral Romantik tip, ince yapılı ancak belirgin kıvrımlara sahiptir. Dramatik ve romantik özelliklerin karışımıdır.',
      'Romantik': 'Romantik vücut tipi, yumuşak hatlar, doğrusal ve feminen bir görünümle karakterizedir. Bu tipteyi bireyler genellikle kısa veya orta boylu olup, belirgin göğüslere, geniş kalçalara ve ince bir bele sahiptir.',
    };
    
    return descriptions[type] || 'Bu vücut tipi için özel bir açıklama henüz mevcut değil.';
  };

  // Stil önerileri
  const getStyleRecommendations = (type: string) => {
    const recommendations: { [key: string]: { clothing: string[], makeup: string[] } } = {
      'Dramatik': {
        clothing: ['Akışkan Bluzlar', 'Yumuşak Bluzlar', 'Hafif Makyaj', 'Doğal Dalgalar'],
        makeup: ['Doğal Dalgalar', 'Hafif Makyaj', 'Yumuşak Bluzlar', 'Akışkan Bluzlar']
      },
      'Romantik': {
        clothing: ['Akışkan Bluzlar', 'Yumuşak Bluzlar', 'Kıvrımlı Kesimler', 'Feminen Detaylar'],
        makeup: ['Doğal Dalgalar', 'Hafif Makyaj', 'Yumuşak Tonlar', 'Romantik Stil']
      }
    };
    
    return recommendations[type] || {
      clothing: ['Kişisel Stil', 'Rahat Kesimler', 'Dengeli Görünüm'],
      makeup: ['Doğal Makyaj', 'Kişisel Tercih', 'Dengeli Yaklaşım']
    };
  };

  const styleRecs = getStyleRecommendations(kibbeType);

  return (
    <div className="results-container fade-in">
      <div className="results-header">
        <h1>Kibbe Vücut Tipi Analiz Sonucunuz</h1>
      </div>

      <div className="results-card">
        <div className="results-image">
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Analiz edilen fotoğraf" />
              <div className="ai-analysis-badge">
                <span>🤖</span> Yapay Zeka Analizi
              </div>
            </>
          ) : (
            <div style={{ 
              width: '100%', 
              height: '300px', 
              background: 'var(--gradient-upload)', 
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '3rem'
            }}>
              👤
            </div>
          )}
        </div>

        <div className="results-content">
          <div className="kibbe-type-badge">
            SİZİN TİPİNİZ
          </div>
          
          <h2 className="kibbe-type-title">{kibbeType}</h2>
          
          <p className="kibbe-description">
            {getKibbeDescription(kibbeType)}
          </p>

          <div className="style-recommendations">
            <div className="recommendation-section">
              <h4>Giyim Önerileri</h4>
              <div className="recommendation-list">
                {styleRecs.clothing.map((item, index) => (
                  <span key={index} className="recommendation-tag">{item}</span>
                ))}
              </div>
            </div>

            <div className="recommendation-section">
              <h4>Saç ve Makyaj Tavsiyeleri</h4>
              <div className="recommendation-list">
                {styleRecs.makeup.map((item, index) => (
                  <span key={index} className="recommendation-tag">{item}</span>
                ))}
              </div>
            </div>
          </div>

          {isSummaryLoading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                Detaylı analiz hazırlanıyor...
              </p>
            </div>
          )}

          {summary && !isSummaryLoading && (
            <div style={{ 
              background: 'rgba(139, 92, 246, 0.05)', 
              padding: '1.5rem', 
              borderRadius: '16px',
              marginTop: '1.5rem',
              border: '1px solid rgba(139, 92, 246, 0.1)'
            }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                🎯 Detaylı Stil Analizi
              </h4>
              <p style={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: '1.6',
                color: 'var(--text-secondary)'
              }}>
                {summary}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="results-actions">
        <button onClick={onGoToChat} className="action-btn primary">
          <span>💬</span>
          Sorularını Kaydet
        </button>
        <button onClick={onNewAnalysis} className="action-btn secondary">
          <span>🔄</span>
          Yeniden Analiz Et
        </button>
        <button 
          onClick={() => window.print()} 
          className="action-btn secondary"
        >
          <span>📄</span>
          Paylaş
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;