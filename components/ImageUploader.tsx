import React, { useRef } from 'react';
import './ImageUploader.css';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="image-uploader-container" onClick={handleContainerClick}>
      <div className="upload-icon">
        <span className="material-symbols-outlined">upload_file</span>
      </div>
      <p className="main-text">Fotoğrafını Uçur Buraya!</p>
      <p className="sub-text">Ya da bilgisayarından seçiver!</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file-input"
      />
    </div>
  );
};

export default ImageUploader;
