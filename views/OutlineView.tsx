import React, { useState, useEffect } from 'react';
import { PaperTask, Annotation, WorkflowStep } from '../types';
import { MessageSquarePlus, RefreshCw, ChevronRight, CheckCircle, Edit3 } from 'lucide-react';
import { generateOutline, regenerateSection } from '../services/geminiService';

interface OutlineViewProps {
  task: PaperTask;
  mode: 'outline' | 'drafting'; // Reusing for both steps
  onUpdateTask: (updates: Partial<PaperTask>) => void;
  onComplete: () => void;
}

export const OutlineView: React.FC<OutlineViewProps> = ({ task, mode, onUpdateTask, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Initial generation for outline
  useEffect(() => {
    if (mode === 'outline' && task.outline.length === 0 && !loading) {
      const initOutline = async () => {
        setLoading(true);
        try {
          const jsonStr = await generateOutline(task.title, task.selectedTopic?.overview || task.title);
          const rawOutline: any[] = JSON.parse(jsonStr);
          const formattedOutline = rawOutline.map((item, idx) => ({
            id: `sec-${idx}`,
            title: item.title,
            content: item.content
          }));
          onUpdateTask({ outline: formattedOutline });
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      initOutline();
    }
  }, [mode]);

  const handleOpenAnnotation = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setSidebarOpen(true);
    setCommentText('');
  };

  const handleRegenerate = async (sectionId: string) => {
    if (!commentText) return;
    
    // Find section
    const sectionIndex = task.outline.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;
    const section = task.outline[sectionIndex];

    setLoading(true); // Ideally localized loading state
    try {
      const newContent = await regenerateSection(section.content, commentText);
      
      const newOutline = [...task.outline];
      newOutline[sectionIndex] = { ...section, content: newContent };
      onUpdateTask({ outline: newOutline });
      
      // Add annotation record
      const newAnnotation: Annotation = {
        id: `ann-${Date.now()}`,
        targetId: sectionId,
        text: "Regeneration Request",
        comment: commentText,
        type: 'user',
        status: 'resolved'
      };
      setAnnotations([...annotations, newAnnotation]);
      setCommentText('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
                {mode === 'outline' ? '大纲及概述' : '文本内容撰写'}
            </h2>
            <button onClick={onComplete} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium">
                <CheckCircle size={18} />
                {mode === 'outline' ? '确定大纲' : '完成初稿'}
            </button>
          </div>

          {loading && task.outline.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-pulse">
                 <RefreshCw className="animate-spin mb-4 text-blue-500" size={32} />
                 <p>正在生成结构化内容...</p>
             </div>
          )}

          <div className="space-y-6">
            {task.outline.map((section) => (
              <div key={section.id} className={`group border rounded-lg transition-all bg-white shadow-sm ${activeSectionId === section.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-200'}`}>
                {/* Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center rounded-t-lg">
                  <h3 className="font-bold text-gray-800 text-lg">{section.title}</h3>
                  <button 
                    onClick={() => handleOpenAnnotation(section.id)}
                    className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                    title="添加批注 / 修改"
                  >
                    <Edit3 size={16} />
                    <span className="text-xs font-medium">批注修改</span>
                  </button>
                </div>
                
                {/* Content */}
                <div 
                    className={`p-4 text-gray-700 leading-relaxed cursor-text relative min-h-[80px] ${mode === 'drafting' ? 'hover:bg-gray-50 transition-colors' : ''}`}
                    onClick={() => mode === 'drafting' ? handleOpenAnnotation(section.id) : null}
                >
                    {section.content}
                    {mode === 'drafting' && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-gray-200 text-xs px-2 py-1 rounded text-gray-500 pointer-events-none">
                            点击段落进行修改
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar for Annotations */}
      {sidebarOpen && activeSectionId && (
        <div className="w-80 bg-gray-50 border-l border-gray-200 shadow-xl flex flex-col animate-slide-in-right">
          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
            <h3 className="font-bold text-gray-700">修改助手</h3>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100">
               当前选中章节: <span className="font-bold">{task.outline.find(s => s.id === activeSectionId)?.title}</span>
            </div>

            {/* History of changes */}
            {annotations.filter(a => a.targetId === activeSectionId).map(ann => (
                <div key={ann.id} className="text-sm bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="font-semibold text-xs text-gray-500 mb-1">修改要求:</div>
                    <div className="text-gray-800 mb-2">{ann.comment}</div>
                    <div className="text-xs text-green-600 flex items-center gap-1 font-medium bg-green-50 w-fit px-2 py-1 rounded">
                        <CheckCircle size={12} /> 已重新生成
                    </div>
                </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">修改建议 / 批注</label>
             <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                placeholder="例如：扩充方法论部分，添加关于...的引用"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
             />
             <button 
                disabled={loading || !commentText}
                onClick={() => activeSectionId && handleRegenerate(activeSectionId)}
                className="mt-3 w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
             >
                {loading ? <RefreshCw className="animate-spin" size={16}/> : <RefreshCw size={16} />}
                根据批注重新生成
             </button>
          </div>
        </div>
      )}
    </div>
  );
};