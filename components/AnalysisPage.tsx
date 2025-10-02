import React, { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeImageWithGemini } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import { sections } from '../constants';
import AnalysisForm from './AnalysisForm';
import Loader from './Loader';

interface AnalysisPageProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  initialImageFile?: File | null;
  onResetImage?: () => void;
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Geçersiz dosya formatı.'));
        return;
      }

      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = (error) => reject(error);
  });

const AnalysisPage: React.FC<AnalysisPageProps> = ({ onAnalysisComplete, initialImageFile = null, onResetImage }) => {
  const [imageFile, setImageFile] = useState<File | null>(initialImageFile);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<AnalysisResult | null>(null);
  const [answers, setAnswers] = useState<AnalysisResult>({});
  const autoAnalyzeRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setImageFile(initialImageFile ?? null);
    if (!initialImageFile) {
      autoAnalyzeRef.current = false;
    }
  }, [initialImageFile]);

  useEffect(() => {
    if (imageFile) {
      setError(null);
    }
  }, [imageFile]);

  const handleFileSelect = (file: File | null) => {
    setImageFile(file);
    setApiResult(null);
    setAnswers({});
    setError(null);
    autoAnalyzeRef.current = false;
  };

  const analyzeCurrentImage = useCallback(async () => {
    if (!imageFile) {
      setError('Lütfen önce bir fotoğraf yükleyin.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Image = await toBase64(imageFile);
      const result = await analyzeImageWithGemini(base64Image, imageFile.type);
      setApiResult(result);
      setAnswers(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analiz sırasında beklenmedik bir hata oluştu.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageFile]);

  useEffect(() => {
    if (!autoAnalyzeRef.current && initialImageFile && imageFile === initialImageFile && !apiResult && !isAnalyzing && imageFile) {
      autoAnalyzeRef.current = true;
      void analyzeCurrentImage();
    }
  }, [analyzeCurrentImage, apiResult, imageFile, initialImageFile, isAnalyzing]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    const missingQuestions: string[] = [];

    sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (!answers[question.id]) {
          missingQuestions.push(question.id);
        }
      });
    });

    if (missingQuestions.length > 0) {
      setError('Lütfen tüm soruları gözden geçirip yanıtlayın.');
      return;
    }

    onAnalysisComplete(answers);
    onResetImage?.();
  };

  return (
    <div className="analysis-v2-container">
      {isAnalyzing ? (
        <Loader />
      ) : (
        <div className="analysis-v2-content">
          <div className="analysis-v2-upload-panel">
            <div className="icon">📸</div>
            <h2>Fotoğrafınızı Yükleyin</h2>
            <p>Analiz için bir fotoğraf seçin ve ardından analizi başlatın.</p>
            {error && <p className="error-message">{error}</p>}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              accept="image/png, image/jpeg, image/webp"
              disabled={isAnalyzing}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="analysis-v2-upload-btn"
              disabled={isAnalyzing}
            >
              {imageFile ? imageFile.name : 'Fotoğraf Seç'}
            </button>
            {imageFile && (
              <button
                onClick={() => handleFileSelect(null)}
                className="analysis-v2-upload-btn"
                style={{ marginTop: '0.5rem', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.6)', color: '#fff' }}
                disabled={isAnalyzing}
              >
                Fotoğrafı Temizle
              </button>
            )}
            {imageFile && !isAnalyzing && (
              <button
                onClick={analyzeCurrentImage}
                className="analysis-v2-upload-btn"
                style={{ marginTop: '1rem', background: 'var(--gradient-primary)' }}
                disabled={isAnalyzing}
              >
                Analizi Başlat
              </button>
            )}
            {apiResult && (
              <div className="analysis-status-message">
                Yanıtlar otomatik olarak dolduruldu. Lütfen kontrol edin.
              </div>
            )}
          </div>
          <div className="analysis-v2-info-panel">
            <div className="badge">YAPAY ZEKA İLE HIZLAN!</div>
            <p>
              Fotoğrafını yüklediğinde soruların büyük kısmını Gemini otomatik doldurur. Tüm yanıtları gözden geçirip sana uygun olduğundan emin olabilirsin.
            </p>
            <ul>
              <li>1. Fotoğrafını yükle ve temel analiz başlasın.</li>
              <li>2. Otomatik doldurulan cevapları incele, gerekirse düzenle.</li>
              <li>3. Analizi tamamla ve kişiselleştirilmiş Kibbe rehberini keşfet.</li>
            </ul>
          </div>
        </div>
      )}
      {apiResult && !isAnalyzing && (
        <div className="analysis-form-wrapper">
          <h3 className="analysis-form-heading">Sonuçları Kontrol Et</h3>
          <p className="analysis-form-subheading">Kutucuklara tıklayarak soruları açabilir, cevapları güncelleyebilirsin.</p>
          <AnalysisForm sections={sections} analysisResult={answers} onAnswerChange={handleAnswerChange} />
          <div className="analysis-form-actions">
            <button
              onClick={handleSubmit}
              className="analysis-v2-upload-btn"
              style={{ marginTop: '1.5rem', background: 'var(--gradient-primary)', alignSelf: 'flex-end' }}
            >
              Analizi Tamamla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;
