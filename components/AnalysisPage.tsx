import React from 'react';
import { sections } from '../constants';
import type { AnalysisResult } from '../types';
import ImageUploader from './ImageUploader';

interface AnalysisPageProps {
  imageFile: File | null;
  imageUrl: string | null;
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  summary: string | null;
  isSummaryLoading: boolean;
  onImageSelect: (file: File | null) => void;
  onAnalysis: () => void;
  onAnswerChange: (questionId: string, answer: string) => void;
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({
  imageFile,
  imageUrl,
  analysisResult,
  isLoading,
  error,
  summary,
  isSummaryLoading,
  onImageSelect,
  onAnalysis,
  onAnswerChange,
}) => {
  const getSectionGradientClass = (sectionId: string) => {
    switch (sectionId) {
      case 'I': return 'bone-structure';
      case 'II': return 'body-type';
      case 'III': return 'face-bones';
      case 'IV': return 'face-lines';
      default: return 'bone-structure';
    }
  };

  return (
    <div className="kibbe-main">
      <div className="kibbe-title">
        <h1>Stilini Eğlenceli Bir Maceraya Dönüştür!</h1>
        <p>Fotoğrafını yükle, yapay zeka sihrini konuşturarak Kibbe vücut tipini ve stilini keşfet. Sana özel ipuçları ve ilhamlarla gardırobunu renklendir!</p>
      </div>

      <ImageUploader onImageSelect={onImageSelect} imageUrl={imageUrl} />

      {imageFile && !analysisResult && (
        <div className="analysis-controls">
          <button onClick={onAnalysis} disabled={isLoading} className="action-btn primary">
            {isLoading ? 'Analiz Ediliyor...' : 'Analiz Et'}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>Stiliniz analiz ediliyor, lütfen bekleyin...</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {/* Survey Sections */}
      <div className="survey-sections">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`survey-section ${getSectionGradientClass(section.id)}`}
          >
            <div className="survey-header">
              <div>
                <h3>{section.title}</h3>
                <div className="section-info">
                  ({section.questions.length} Soru)
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisPage;