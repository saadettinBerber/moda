import React, { useState, useRef } from 'react';

const Faq: React.FC = () => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const accordionRefs = {
    'bone-structure': useRef<HTMLDivElement>(null),
    'body-type': useRef<HTMLDivElement>(null),
    'facial-bones': useRef<HTMLDivElement>(null),
    'facial-features': useRef<HTMLDivElement>(null),
  };

  const handleAccordionToggle = (sectionId: string) => {
    setActiveAccordion(prev => (prev === sectionId ? null : sectionId));
  };

  const getAccordionItemClasses = (sectionId: string) => {
    return `accordion-item bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden mb-4 ${activeAccordion === sectionId ? 'active' : ''}`;
  };

  const getAccordionContentStyle = (sectionId: string): React.CSSProperties => {
    const isActive = activeAccordion === sectionId;
    const contentRef = accordionRefs[sectionId as keyof typeof accordionRefs];
    return {
      maxHeight: isActive && contentRef.current ? `${contentRef.current.scrollHeight}px` : '0',
    };
  };

  return (
    <div className="max-w-6xl mx-auto mt-16" id="questions-container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={() => handleAccordionToggle('bone-structure')} className="question-box text-white rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 shadow-lg cursor-pointer p-6 text-center flex flex-col justify-center items-center h-48">
          <span className="material-symbols-outlined text-5xl mb-3 text-white/80">account_circle</span>
          <h3 className="font-bold text-lg leading-tight">İskelet Yapın</h3>
        </div>
        <div onClick={() => handleAccordionToggle('body-type')} className="question-box text-white rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg cursor-pointer p-6 text-center flex flex-col justify-center items-center h-48">
          <span className="material-symbols-outlined text-5xl mb-3 text-white/80">fitness_center</span>
          <h3 className="font-bold text-lg leading-tight">Vücut Hatların</h3>
        </div>
        <div onClick={() => handleAccordionToggle('facial-bones')} className="question-box text-white rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 shadow-lg cursor-pointer p-6 text-center flex flex-col justify-center items-center h-48">
          <span className="material-symbols-outlined text-5xl mb-3 text-white/80">face_6</span>
          <h3 className="font-bold text-lg leading-tight">Yüz Kemiklerin</h3>
        </div>
        <div onClick={() => handleAccordionToggle('facial-features')} className="question-box text-white rounded-2xl bg-gradient-to-br from-green-400 to-lime-500 shadow-lg cursor-pointer p-6 text-center flex flex-col justify-center items-center h-48">
          <span className="material-symbols-outlined text-5xl mb-3 text-white/80">sentiment_satisfied</span>
          <h3 className="font-bold text-lg leading-tight">Yüz Detayların</h3>
        </div>
      </div>
      <div id="accordion-container">
        <div className={getAccordionItemClasses('bone-structure')}>
          <div onClick={() => handleAccordionToggle('bone-structure')} className="flex items-center justify-between w-full p-6 text-left text-xl font-bold rounded-t-2xl text-gray-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-pink-500">account_circle</span>
              <span>İskelet Yapısı: Boyut ve Ağırlık</span>
            </div>
            <span className="material-symbols-outlined arrow text-gray-600">expand_more</span>
          </div>
          <div className="accordion-content px-6" style={getAccordionContentStyle('bone-structure')} ref={accordionRefs['bone-structure']}>
            <p className="text-gray-700 py-4">Sıra dışı iskelet yapıları ve oranları keşfetmek için bu bölümü incele. Yapay zeka analizinin ardından ince ayarlar yapabilirsin!</p>
          </div>
        </div>
        <div className={getAccordionItemClasses('body-type')}>
          <div onClick={() => handleAccordionToggle('body-type')} className="flex items-center justify-between w-full p-6 text-left text-xl font-bold rounded-t-2xl text-gray-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-purple-500">fitness_center</span>
              <span>Vücut Hatları: Yumuşaklık ve Keskinlik</span>
            </div>
            <span className="material-symbols-outlined arrow text-gray-600">expand_more</span>
          </div>
          <div className="accordion-content px-6" style={getAccordionContentStyle('body-type')} ref={accordionRefs['body-type']}>
            <p className="text-gray-700 py-4">Vücudunun daha yumuşak mı yoksa daha keskin hatlara mı sahip olduğunu öğren. İpucu: Bu, giyim tarzını büyük ölçüde etkiler!</p>
          </div>
        </div>
        <div className={getAccordionItemClasses('facial-bones')}>
          <div onClick={() => handleAccordionToggle('facial-bones')} className="flex items-center justify-between w-full p-6 text-left text-xl font-bold rounded-t-2xl text-gray-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-500">face_6</span>
              <span>Yüz Kemikleri: Köşeli mi, Yuvarlak mı?</span>
            </div>
            <span className="material-symbols-outlined arrow text-gray-600">expand_more</span>
          </div>
          <div className="accordion-content px-6" style={getAccordionContentStyle('facial-bones')} ref={accordionRefs['facial-bones']}>
            <p className="text-gray-700 py-4">Yüz kemiklerinin belirginliği ve şekli hakkında bilgi edin. Keskin veya yuvarlak hatlar stilini nasıl etkiler?</p>
          </div>
        </div>
        <div className={getAccordionItemClasses('facial-features')}>
          <div onClick={() => handleAccordionToggle('facial-features')} className="flex items-center justify-between w-full p-6 text-left text-xl font-bold rounded-t-2xl text-gray-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-500">sentiment_satisfied</span>
              <span>Yüz Detayları: Dudaklar, Gözler ve Burun</span>
            </div>
            <span className="material-symbols-outlined arrow text-gray-600">expand_more</span>
          </div>
          <div className="accordion-content px-6" style={getAccordionContentStyle('facial-features')} ref={accordionRefs['facial-features']}>
            <p className="text-gray-700 py-4">Yüzündeki yumuşak dokuların (dudaklar, gözler, burun) oranları ve belirginlikleri stilinde büyük fark yaratabilir.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;