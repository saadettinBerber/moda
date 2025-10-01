import React from 'react';
import type { AnalysisResult } from '../types';
import ImageUploader from './ImageUploader'; // Assuming ImageUploader is adapted or we create a new one.

interface AnalysisPageProps {
  imageFile: File | null;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onImageSelect: (file: File | null) => void;
  onAnalysis: () => void;
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({
  imageUrl,
  isLoading,
  error,
  onImageSelect,
  onAnalysis,
}) => {
  return (
    <div className="analysis-v2-container">
      <div className="analysis-v2-content">
        <div className="analysis-v2-upload-panel">
          <div className="icon">📸</div>
          <h2>Fotoğrafınızı Yükleyin</h2>
          <p>Gemini 2.5 Flash soruları otomatik olarak senin için dolduracak.</p>
          {/* We can integrate the ImageUploader logic here or use a simplified button */}
          <button onClick={() => document.getElementById('image-upload-input')?.click()} className="analysis-v2-upload-btn">
            Fotoğraf Yükle
          </button>
          <input 
             type="file" 
             id="image-upload-input" 
             style={{ display: 'none' }} 
             onChange={(e) => onImageSelect(e.target.files ? e.target.files[0] : null)}
             accept="image/png, image/jpeg, image/webp"
          />
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
    </div>
  );
};

export default AnalysisPage;