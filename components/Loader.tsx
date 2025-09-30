
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg h-full">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mt-6">Analiz yapılıyor...</h3>
      <p className="text-gray-500 mt-2 text-center">Yapay zeka vücut tipinizi analiz ediyor. <br/> Bu işlem birkaç saniye sürebilir.</p>
    </div>
  );
};

export default Loader;
