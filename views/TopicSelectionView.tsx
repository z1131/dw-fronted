import React, { useState } from 'react';
import { PaperTask, Topic, WorkflowStep } from '../types';
import { Upload, Search, ArrowRight, Lightbulb, FileCheck } from 'lucide-react';
import { generateTopicIdeas, analyzeTopicDocs } from '../services/geminiService';

interface TopicSelectionViewProps {
  task: PaperTask;
  onUpdateTask: (updates: Partial<PaperTask>) => void;
  onComplete: () => void;
}

export const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({ task, onUpdateTask, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<Topic[]>([]);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  
  // Form State for "New Topic"
  const [major, setMajor] = useState('');
  const [direction, setDirection] = useState('');
  const [research, setResearch] = useState('');

  // Form State for "Existing"
  const [existingPrompt, setExistingPrompt] = useState('');

  const handleModeSelect = (mode: 'existing' | 'new') => {
    onUpdateTask({ topicMode: mode });
  };

  const handleGenerateTopics = async () => {
    if (!major || !direction) return;
    setLoading(true);
    try {
      const jsonStr = await generateTopicIdeas(major, direction, research);
      const topics: any[] = JSON.parse(jsonStr);
      setGeneratedTopics(topics.map((t, i) => ({
        id: `topic-${Date.now()}-${i}`,
        title: t.title,
        overview: t.overview,
        fullDetail: t.overview + " [详细内容将在此处生成...]"
      })));
    } catch (e) {
      console.error(e);
      alert("生成选题失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeExisting = async () => {
    setLoading(true);
    try {
      const result = await analyzeTopicDocs(existingPrompt);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectTopic = (topic: Topic) => {
    onUpdateTask({ selectedTopic: topic });
  };

  const confirmSelection = () => {
    if (task.selectedTopic || task.topicMode === 'existing') {
        // If mode is existing, we assume title is set manually or extracted
        if (task.topicMode === 'existing' && !task.title.includes("Untitled")) {
            // Already good
        } else if (task.topicMode === 'existing') {
             onUpdateTask({ title: "自定义开题报告" });
        } else if (task.selectedTopic) {
             onUpdateTask({ title: task.selectedTopic.title });
        }
      onComplete();
    }
  };

  if (!task.topicMode) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 space-y-8 p-10 animate-fade-in">
        <div className="flex gap-6">
          <div 
            onClick={() => handleModeSelect('existing')}
            className="w-64 p-8 bg-white rounded-xl shadow-lg border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">已选题</h3>
            <p className="text-gray-500 text-sm">上传开题报告或输入您的想法</p>
          </div>

          <div 
            onClick={() => handleModeSelect('new')}
            className="w-64 p-8 bg-white rounded-xl shadow-lg border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all flex flex-col items-center text-center group"
          >
             <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <Lightbulb size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">开始选题</h3>
            <p className="text-gray-500 text-sm">构建研究题目</p>
          </div>
        </div>
      </div>
    );
  }

  // New Topic Flow
  if (task.topicMode === 'new') {
    return (
      <div className="max-w-4xl mx-auto p-8">
        {!task.selectedTopic ? (
          <div className="space-y-8 animate-fade-in">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <Search className="text-blue-500"/>
                    选题参数
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">专业 <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="例如：计算机科学与技术"
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">研究方向 <span className="text-red-500">*</span></label>
                         <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="例如：深度学习"
                            value={direction}
                            onChange={(e) => setDirection(e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                         <label className="block text-sm font-medium text-gray-700 mb-1">具体研究兴趣（选填）</label>
                         <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="例如：医学图像分析"
                            value={research}
                            onChange={(e) => setResearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleGenerateTopics}
                        disabled={loading || !major || !direction}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                    >
                        {loading ? '思考中...' : '生成选题'}
                        {!loading && <ArrowRight size={16} />}
                    </button>
                </div>
             </div>

             {generatedTopics.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {generatedTopics.map(topic => (
                         <div key={topic.id} onClick={() => selectTopic(topic)} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg cursor-pointer transition-all hover:border-blue-300 group">
                             <div className="h-full flex flex-col">
                                <h4 className="font-bold text-lg text-gray-800 mb-3 group-hover:text-blue-600">{topic.title}</h4>
                                <p className="text-gray-600 text-sm flex-1 leading-relaxed">{topic.overview}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 text-blue-500 text-sm font-medium flex items-center gap-1">
                                    查看详情 <ArrowRight size={14} />
                                </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
          </div>
        ) : (
            // Detail View
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 animate-slide-in-right">
                <div className="p-8 border-b border-gray-100">
                    <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">已选定主题</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{task.selectedTopic.title}</h2>
                    <p className="text-gray-700 leading-relaxed text-lg">{task.selectedTopic.overview}</p>
                </div>
                <div className="bg-gray-50 p-6 flex justify-between items-center">
                    <button onClick={() => onUpdateTask({ selectedTopic: undefined })} className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors">返回选题列表</button>
                    <button onClick={confirmSelection} className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 shadow-md font-bold flex items-center gap-2">
                        <FileCheck size={20} />
                        确定选题
                    </button>
                </div>
            </div>
        )}
      </div>
    );
  }

  // Existing Topic Flow
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-800">已有开题报告</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors mb-6 group">
                <Upload size={32} className="mb-2 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-medium">点击上传开题报告 (PDF/Word)</span>
                <input type="file" className="hidden" />
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">或者手动输入提示词/概述</label>
            <textarea
                className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="在此粘贴您的选题摘要或输入指导提示词..."
                value={existingPrompt}
                onChange={(e) => setExistingPrompt(e.target.value)}
            />
            
            <div className="mt-4 flex justify-end">
                <button 
                    onClick={handleAnalyzeExisting}
                    disabled={loading || !existingPrompt}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                    {loading ? '分析中...' : '分析选题'}
                </button>
            </div>
        </div>

        {analysisResult && (
             <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500 animate-fade-in">
                 <h4 className="font-bold text-lg mb-2 text-purple-700 flex items-center gap-2">
                     <Lightbulb size={20} />
                     AI 分析结果
                 </h4>
                 <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                     {analysisResult}
                 </div>
                 <div className="mt-6 flex justify-end">
                     <button onClick={confirmSelection} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md flex items-center gap-2 font-medium">
                        <FileCheck size={18} />
                        确定并继续
                     </button>
                 </div>
             </div>
        )}
    </div>
  );
};