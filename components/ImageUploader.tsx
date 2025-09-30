
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  imageUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imageUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-section">
      <div className="upload-content">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="upload-input"
          id="image-upload"
          style={{ display: 'none' }}
          accept="image/png, image/jpeg, image/webp"
        />
        <label htmlFor="image-upload" className="image-drop-area" onClick={handleClick}>
          {imageUrl ? (
            <img src={imageUrl} alt="Yüklenen fotoğraf" className="uploaded-image" />
          ) : (
            <>
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28 8H12C10.9 8 10.01 8.9 10.01 10L10 38C10 39.1 10.89 40 11.99 40H36C37.1 40 38 39.1 38 38V16L28 8ZM24 22V32H26V22H24ZM24 22L20 26H22V22H24ZM24 22H28L24 18V22Z" fill="url(#paint0_linear_1_12)"/>
                  <defs>
                    <linearGradient id="paint0_linear_1_12" x1="10" y1="24" x2="38" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F472B6"/>
                      <stop offset="1" stopColor="#A78BFA"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3>Fotoğrafını Uçur Buraya!</h3>
              <p>Ya da bilgisayarından seçiver!</p>
            </>
          )}
        </label>
      </div>
      <div className="analysis-categories">
        <div className="category-card">
          <div className="category-icon">👤</div>
          <span>İskelet Yapın</span>
        </div>
        <div className="category-card">
          <div className="category-icon">🏋️</div>
          <span>Vücut Hatların</span>
        </div>
        <div className="category-card">
          <div className="category-icon">😊</div>
          <span>Yüz Kemiklerin</span>
        </div>
        <div className="category-card">
          <div className="category-icon">😄</div>
          <span>Yüz Detayların</span>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
