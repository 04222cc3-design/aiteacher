
import React from 'react';

interface InteractiveChoicesProps {
  choices: string[];
  onChoiceSelected: (choice: string) => void;
}

export const InteractiveChoices: React.FC<InteractiveChoicesProps> = ({ choices, onChoiceSelected }) => {
  return (
    <div className="p-4 border-t border-slate-700 bg-slate-900 animate-fade-in-up">
       <style>{`
        @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
      <div className="flex flex-wrap justify-center gap-3">
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => onChoiceSelected(choice)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
};
