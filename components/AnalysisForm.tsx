
import React, { useState } from 'react';
import type { Section, AnalysisResult } from '../types';

interface AnalysisFormProps {
  sections: Section[];
  analysisResult: AnalysisResult;
  onAnswerChange: (questionId: string, answer: string) => void;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ sections, analysisResult, onAnswerChange }) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const getSectionColorClass = (sectionId: string) => {
    const colors = {
      'I': 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600', // Kemik Yapısı - Mor/İndigo
      'II': 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-500', // Beden Tipi - Pembe/Kırmızı
      'III': 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500', // Yüz Kemikleri - Mavi/Turkuaz
      'IV': 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600', // Yüz Hatları - Yeşil/Zümrüt
      'V': 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500', // Saç - Turuncu/Sarı
    };
    return colors[sectionId as keyof typeof colors] || 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  const getSectionProgress = (section: Section) => {
    const answeredQuestions = section.questions.filter(q => analysisResult[q.id]).length;
    return { answered: answeredQuestions, total: section.questions.length };
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleAllSections = () => {
    if (openSections.size === sections.length) {
      setOpenSections(new Set());
    } else {
      setOpenSections(new Set(sections.map(s => s.id)));
    }
  };

  const allOpen = openSections.size === sections.length;

  return (
    <div className="space-y-4">
      {/* Toggle All Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleAllSections}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <span>{allOpen ? 'Tümünü Kapat' : 'Tümünü Aç'}</span>
          <svg className={`w-4 h-4 transform transition-transform duration-200 ${allOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          const progress = getSectionProgress(section);
          const isCompleted = progress.answered === progress.total;
          
          return (
            <div key={section.id} className="accordion-section rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Section Header - Clickable Colorful Box */}
              <div
                className={`accordion-header w-full p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${getSectionColorClass(section.id)} ${isOpen ? 'shadow-xl' : 'shadow-md'}`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {/* Section Icon */}
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{section.id}</span>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-white tracking-wide drop-shadow-sm">
                          {section.title}
                        </h3>
                        <p className="text-white text-opacity-80 text-sm">
                          {progress.answered}/{progress.total} soru tamamlandı ({progress.total ? Math.round((progress.answered / progress.total) * 100) : 0}%)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Progress Circle */}
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-white text-opacity-20"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-white"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${progress.total ? (progress.answered / progress.total) * 100 : 0}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isCompleted ? (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-white text-xs font-bold">{progress.answered}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Expand/Collapse Icon */}
                    <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                      <svg className="w-6 h-6 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Content - Collapsible */}
              {isOpen && (
                <div className="accordion-content bg-white animate-slideDown">
                  <div className="px-6 py-6 space-y-6">
                    {section.questions.map((question) => (
                      <fieldset key={question.id} className="bg-gray-50 rounded-lg p-4">
                        <legend className="text-lg font-semibold text-gray-800 mb-4 px-2">
                          {question.id}. {question.text}
                        </legend>
                        <div className="space-y-3">
                          {question.options.map((option) => (
                            <label
                              key={option.id}
                              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                                analysisResult[question.id] === option.id
                                  ? 'bg-white border-blue-500 ring-2 ring-blue-200 shadow-md'
                                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              }`}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={option.id}
                                checked={analysisResult[question.id] === option.id}
                                onChange={() => onAnswerChange(question.id, option.id)}
                                className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-4 flex flex-col">
                                <span className="font-semibold text-gray-900 text-base">
                                  {option.id.toUpperCase()}. {option.text}
                                </span>
                                {option.subtext && (
                                  <span className="text-gray-600 mt-1 text-sm leading-relaxed">
                                    {option.subtext}
                                  </span>
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisForm;
