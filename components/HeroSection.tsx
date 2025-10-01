import React from 'react';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <h1 className="hero-title">Stilini Eğlenceli Bir Maceraya Dönüştür!</h1>
      <p className="hero-subtitle">
        Yapay zeka destekli stil asistanınla tanış. Sadece bir fotoğrafını yükle, vücut tipini analiz edelim ve sana özel stil önerileri sunalım. Tarzını yeniden keşfetmeye hazır mısın?
      </p>
    </section>
  );
};

export default HeroSection;