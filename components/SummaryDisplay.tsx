import React from 'react';

interface SummaryDisplayProps {
  summary: string | null;
  isLoading: boolean;
}

const SummaryLoader: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-3 bg-gray-200 rounded w-full"></div>
    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
  </div>
);


const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, isLoading }) => {
  if (!isLoading && !summary) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-wide flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Vücut Tipi Özeti ve Stil Önerileri
      </h3>
      <div className="p-5 border border-blue-200 rounded-lg bg-blue-50/50 text-gray-700">
        {isLoading ? (
            <SummaryLoader />
        ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</p>
        )}
      </div>
    </div>
  );
};

export default SummaryDisplay;
