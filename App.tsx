import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ImageUploader from './components/ImageUploader';
import FeatureCard from './components/FeatureCard';
import ChatButton from './components/ChatButton';
import AnalysisPage from './components/AnalysisPage';
import ResultsPage from './components/ResultsPage';
import type { AnalysisResult } from './types';

// İkonlar için placeholder'lar - gerçek ikonlar veya resimler buraya gelecek
const StyleIcon = () => <span>👗</span>;
const BodyIcon = () => <span>🧍‍♀️</span>;
const ColorIcon = () => <span>🎨</span>;
const FabricIcon = () => <span>🧵</span>;

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    navigate('/sonuclarim', { state: result });
  };

  const handleImageSelectAndNavigate = (file: File) => {
    setAnalysisResult(null);
    setImageFile(file);
    navigate('/analiz');
  };

  return (
    <div className="app-container">
      <Header />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <ImageUploader onImageSelect={handleImageSelectAndNavigate} />
                <div className="features-container">
                  <FeatureCard
                    icon={<StyleIcon />}
                    title="Stil Analizi"
                    description="Yüklediğiniz fotoğraftan stilinizi analiz eder."
                    gradient="linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)"
                  />
                  <FeatureCard
                    icon={<BodyIcon />}
                    title="Vücut Tipi"
                    description="Vücut tipinizi belirleyerek en uygun kıyafetleri önerir."
                    gradient="linear-gradient(to right, #84fab0 0%, #8fd3f4 100%)"
                  />
                  <FeatureCard
                    icon={<ColorIcon />}
                    title="Renk Paleti"
                    description="Ten renginize en uygun renk paletini oluşturur."
                    gradient="linear-gradient(to right, #a18cd1 0%, #fbc2eb 100%)"
                  />
                  <FeatureCard
                    icon={<FabricIcon />}
                    title="Kumaş Önerileri"
                    description="Stilinize ve vücut tipinize uygun kumaşları listeler."
                    gradient="linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)"
                  />
                </div>
              </>
            }
          />
          <Route
            path="/analiz"
            element={
              <AnalysisPage
                onAnalysisComplete={handleAnalysisComplete}
                initialImageFile={imageFile}
                onResetImage={() => setImageFile(null)}
              />
            }
          />
          <Route path="/sonuclarim" element={<ResultsPage initialResult={analysisResult} />} />
        </Routes>
      </main>
      <ChatButton />
    </div>
  );
};

export default App;
