import React from 'react';
import { Info, TrendingUp, BarChart2, Activity } from 'lucide-react'; // Install lucide-react for icons

const PredictionCard = ({ modelName, numbers, confidence, rationale, type }) => {
  // Color coding based on confidence score
  const getConfidenceColor = (score) => {
    if (score >= 0.7) return '#10b981';
    if (score >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const getIcon = () => {
    if (modelName.includes('Frequency')) return <BarChart2 className="w-6 h-6" style={{color: '#60a5fa'}} />;
    if (modelName.includes('XGBoost')) return <TrendingUp className="w-6 h-6" style={{color: '#a78bfa'}} />;
    return <Activity className="w-6 h-6" style={{color: '#f472b6'}} />; // LSTM
  };

  return (
    <div className="rounded-xl p-4 md:p-6 transition-all" style={{background: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'}}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#334155';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1e293b';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.5)';
      }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-4 gap-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 rounded-lg" style={{background: '#1e293b'}}>{getIcon()}</div>
          <div>
            <h3 className="font-bold text-white text-base md:text-lg">{modelName}</h3>
            <p className="text-xs uppercase tracking-wider" style={{color: '#64748b'}}>AI Model</p>
          </div>
        </div>
        {/* Confidence Badge */}
        <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
          <span className="text-xs font-semibold mb-1" style={{color: '#64748b'}}>Confidence</span>
          <div className="flex items-center gap-2">
            <div className="w-16 md:w-20 h-2 rounded-full overflow-hidden" style={{background: '#1e293b'}}>
              <div 
                className="h-full transition-all duration-500" 
                style={{ width: `${confidence * 100}%`, background: getConfidenceColor(confidence) }} 
              />
            </div>
            <span className="text-xs md:text-sm font-bold text-white">{Math.round(confidence * 100)}%</span>
          </div>
        </div>
      </div>

      {/* The Numbers Display */}
      <div className="my-4 md:my-6">
        {type === '4d' ? (
          <div className="space-y-2 md:space-y-3">
            {numbers.map((num, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 md:px-4 py-2 rounded-lg" style={{background: '#1e293b', border: '1px solid #334155'}}>
                <span className="text-xs font-semibold uppercase" style={{color: '#64748b'}}>
                  {idx === 0 ? '1st Prize' : idx === 1 ? '2nd Prize' : '3rd Prize'}
                </span>
                <span className="font-mono font-bold text-lg md:text-xl text-white" style={{letterSpacing: '0.1em'}}>
                  {num}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {numbers.map((num, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center justify-center font-mono font-bold shadow-sm"
                style={{ width: '36px', height: '36px', fontSize: '1rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderRadius: '9999px', border: '1px solid rgba(59, 130, 246, 0.3)' }}
              >
                {num}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rationale Section (Educational Requirement) */}
      <div className="p-2.5 md:p-3 rounded-lg" style={{background: '#1e293b', border: '1px solid #334155'}}>
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 flex-shrink-0" style={{color: '#64748b'}} />
          <p className="text-xs md:text-sm leading-relaxed" style={{color: '#cbd5e1'}}>{rationale}</p>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;