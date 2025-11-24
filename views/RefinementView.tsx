import React, { useState, useEffect } from 'react';
import { PaperTask, Annotation } from '../types';
import { Sparkles, Check, AlertCircle } from 'lucide-react';
import { generateRefinementSuggestions } from '../services/geminiService';

interface RefinementViewProps {
  task: PaperTask;
}

export const RefinementView: React.FC<RefinementViewProps> = ({ task }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (!task.refinementSuggestions && !loading) {
      const runRefinement = async () => {
        setLoading(true);
        try {
          // Aggregate content for analysis
          const fullText = task.outline.map(s => s.content).join('\n\n');
          const jsonStr = await generateRefinementSuggestions(fullText);
          const rawSuggestions = JSON.parse(jsonStr);
          setSuggestions(rawSuggestions);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      runRefinement();
    }
  }, []);

  return (
    <div className="h-full bg-gray-50 p-8 flex gap-6 overflow-hidden">
      {/* Document View */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto p-8 relative">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">{task.title}</h2>
        
        {task.outline.map((section, idx) => (
           <div key={idx} className="mb-8">
               <h3 className="text-xl font-bold text-gray-800 mb-3">{section.title}</h3>
               <p className="text-gray-700 leading-relaxed">{section.content}</p>
           </div> 
        ))}

        {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm z-10">
                <div className="text-center">
                    <Sparkles className="animate-spin text-amber-500 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-medium text-gray-800">AI 正在精修您的论文...</h3>
                    <p className="text-gray-500">正在检查引用、清晰度和逻辑流畅性。</p>
                </div>
            </div>
        )}
      </div>

      {/* Suggestions Sidebar */}
      <div className="w-96 flex flex-col shadow-lg rounded-xl overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center gap-2">
            <Sparkles className="text-amber-400" size={20} />
            <h3 className="font-bold">AI 精修建议</h3>
        </div>
        <div className="flex-1 bg-white border border-gray-200 border-t-0 overflow-y-auto p-4 space-y-4">
            {suggestions.length === 0 && !loading && (
                <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                    <Check className="text-green-500 mb-2" size={32} />
                    暂无具体的修改建议。写得不错！
                </div>
            )}
            
            {suggestions.map((sugg, idx) => (
                <div key={idx} className="bg-amber-50 border border-amber-100 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-2 mb-2">
                        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">建议优化</p>
                    </div>
                    <div className="text-sm text-gray-800 mb-3 font-medium bg-white/50 p-2 rounded italic">
                        "{sugg.text}"
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                        {sugg.comment}
                    </div>
                    <button className="w-full border border-amber-200 text-amber-700 text-xs py-2 rounded hover:bg-amber-100 transition-colors flex items-center justify-center gap-1 font-medium bg-white">
                        <Check size={12} /> 标记为已解决
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};