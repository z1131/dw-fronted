import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { PaperTask, Topic } from '../types';
import { Upload, Search, ArrowRight, Lightbulb, FileCheck, Sparkles, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { topicService } from '../services/topicService';

interface TopicSelectionViewProps {
  task: PaperTask;
  onUpdateTask: (updates: Partial<PaperTask>) => void;
  onComplete: () => void;
}

export const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({ task, onUpdateTask, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<Topic[]>([]);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate');

  // Form State
  const [major, setMajor] = useState('');
  const [direction, setDirection] = useState('');
  const [research, setResearch] = useState('');

  // Analyze Mode State
  const [existingPrompt, setExistingPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateTopics = async () => {
    if (!major || !direction) return;
    setLoading(true);
    try {
      const projectId = parseInt(task.id);
      if (isNaN(projectId)) {
        alert("错误：无效的项目ID。请刷新页面重试。");
        return;
      }

      const initialIdea = `Major: ${major}, Direction: ${direction}. ${research ? `Interest: ${research}` : ''}`;
      const topics = await topicService.generateTopics(projectId, initialIdea);

      setGeneratedTopics(topics.map((t, i) => ({
        id: `topic-${Date.now()}-${i}`,
        title: t.title,
        overview: t.overview,
        fullDetail: t.overview
      })));

      // Update task mode implicitly
      onUpdateTask({ topicMode: 'new' });
    } catch (e) {
      console.error(e);
      alert("生成选题失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAnalyzeExisting = async () => {
    if (!selectedFile && !existingPrompt) {
      alert("请上传文件或输入内容");
      return;
    }

    setLoading(true);
    try {
      const projectId = parseInt(task.id);
      if (isNaN(projectId)) {
        alert("错误：无效的项目ID。请刷新页面重试。");
        return;
      }

      // Update task mode implicitly
      onUpdateTask({ topicMode: 'existing' });

      if (selectedFile) {
        const result = await topicService.analyzeTopic(projectId, selectedFile, existingPrompt || "Untitled Topic");

        let formattedResult = `**可行性**: ${result.feasibility}\n\n**创新性**: ${result.innovation}\n\n**建议**:\n${result.suggestions.map((s: string) => `- ${s}`).join('\n')}`;
        if (result.refined_topic) {
          formattedResult += `\n\n**优化后的题目**: ${result.refined_topic}`;
        }
        setAnalysisResult(formattedResult);
      } else {
        alert("目前仅支持文件上传分析。请上传您的开题报告。");
      }
    } catch (e) {
      console.error(e);
      alert("分析失败，请检查网络或重试。");
    } finally {
      setLoading(false);
    }
  };

  const selectTopic = (topic: Topic) => {
    onUpdateTask({ selectedTopic: topic });
  };

  const confirmSelection = async () => {
    // Determine what we are confirming based on active tab/state
    const isGenerateMode = activeTab === 'generate';
    const isAnalyzeMode = activeTab === 'analyze';

    if ((isGenerateMode && task.selectedTopic) || (isAnalyzeMode && analysisResult)) {
      setLoading(true);
      try {
        const projectId = parseInt(task.id);
        if (isNaN(projectId)) throw new Error("Invalid Project ID");

        let title = "Untitled";
        if (isAnalyzeMode) {
          // For existing/analyze mode, use existing title or default
          title = !task.title.includes("Untitled") ? task.title : (selectedFile?.name.split('.')[0] || "自定义开题报告");
          // Ensure task mode is set correctly for backend consistency if needed
          onUpdateTask({ topicMode: 'existing' });
        } else if (isGenerateMode && task.selectedTopic) {
          title = task.selectedTopic.title;
          onUpdateTask({ topicMode: 'new' });
        }

        await topicService.confirmTopic(projectId, title);
        onUpdateTask({ title });
        onComplete();
      } catch (e) {
        console.error(e);
        alert("确认选题失败，请重试。");
      } finally {
        setLoading(false);
      }
    }
  };


  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null);

  const openTopicDetail = (topic: Topic) => {
    setViewingTopic(topic);
  };

  const closeTopicDetail = () => {
    setViewingTopic(null);
  };

  const confirmTopicFromModal = () => {
    if (viewingTopic) {
      selectTopic(viewingTopic);
      setViewingTopic(null);
    }
  };

  return (
    <div className="flex h-full bg-[#f8fafc] animate-fade-in overflow-hidden relative">
      {/* Left Panel: Configuration */}
      <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Search className="text-blue-600" size={24} />
            选题工作台
          </h2>
          <p className="text-gray-500 text-sm mt-1">配置您的研究方向或上传现有报告</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          {/* Global Context */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">基础信息</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">专业领域 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="例如：计算机科学"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">研究方向 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="例如：大语言模型"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
              />
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'generate' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Sparkles size={16} />
              AI 生成灵感
            </button>
            <button
              onClick={() => setActiveTab('analyze')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'analyze' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FileText size={16} />
              分析现有报告
            </button>
          </div>

          {/* Dynamic Inputs based on Tab */}
          <div className="animate-fade-in">
            {activeTab === 'generate' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">具体兴趣点 (选填)</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="例如：关注边缘计算场景下的模型压缩..."
                    value={research}
                    onChange={(e) => setResearch(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleGenerateTopics}
                  disabled={loading || !major || !direction}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
                >
                  <Sparkles size={18} />
                  开始生成选题
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${selectedFile ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <>
                      <FileCheck size={32} className="mb-2 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700 truncate max-w-full px-2">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500 mt-1">点击更换</span>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="mb-2 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">上传开题报告</span>
                      <span className="text-xs text-gray-400 mt-1">支持 PDF, Word</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">补充说明 (选填)</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    placeholder="输入额外的指导意见..."
                    value={existingPrompt}
                    onChange={(e) => setExistingPrompt(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleAnalyzeExisting}
                  disabled={loading || (!selectedFile && !existingPrompt)}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-bold flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
                >
                  <Lightbulb size={18} />
                  开始分析
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Results */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-6 animate-fade-in">
              <Loader2 size={48} className="animate-spin text-blue-600" />
              <p className="text-lg font-medium animate-pulse">正在思考中...</p>
            </div>
          ) : (
            activeTab === 'generate' ? (
              generatedTopics.length > 0 ? (
                <div className="max-w-5xl mx-auto">
                  <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <Sparkles className="text-blue-500" size={20} />
                    生成的候选题目
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
                    {generatedTopics.map(topic => {
                      const isSelected = task.selectedTopic?.id === topic.id;
                      return (
                        <div
                          key={topic.id}
                          onClick={() => openTopicDetail(topic)}
                          className={`
                                            relative bg-white p-6 rounded-xl border-2 transition-all cursor-pointer group
                                            ${isSelected
                              ? 'border-blue-500 shadow-lg ring-4 ring-blue-50'
                              : 'border-transparent shadow-sm hover:shadow-md hover:border-blue-200'}
                                        `}
                        >
                          {isSelected && (
                            <div className="absolute top-4 right-4 text-blue-600">
                              <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                            </div>
                          )}
                          <h4 className={`font-bold text-lg mb-3 pr-8 ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                            {topic.title}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                            {topic.overview}
                          </p>
                          <div className="mt-4 pt-4 border-t border-gray-100 text-blue-500 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            查看详情 <ArrowRight size={14} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <Sparkles size={40} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-medium">在左侧输入信息并点击生成</p>
                </div>
              )
            ) : (
              analysisResult ? (
                <div className="max-w-4xl mx-auto pb-24">
                  <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-purple-500 animate-slide-in-up">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <FileText className="text-purple-600" size={24} />
                      分析报告
                    </h3>
                    <div className="prose prose-slate max-w-none">
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                        <ReactMarkdown>{analysisResult}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload size={40} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-medium">上传文件以开始分析</p>
                </div>
              )
            )
          )}
        </div>

        {/* Floating Action Bar */}
        {((activeTab === 'generate' && task.selectedTopic) || (activeTab === 'analyze' && analysisResult)) && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-200 flex justify-end items-center gap-4 animate-slide-in-up z-20">
            <div className="text-sm text-gray-600 font-medium mr-auto">
              {activeTab === 'generate'
                ? `已选择: ${task.selectedTopic?.title}`
                : "分析完成，确认使用此结果？"
              }
            </div>
            <button
              onClick={confirmSelection}
              disabled={loading}
              className={`
                        px-8 py-3 rounded-lg text-white font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95
                        ${activeTab === 'generate' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
                    `}
            >
              <FileCheck size={20} />
              {loading ? '处理中...' : '确认并继续'}
            </button>
          </div>
        )}
      </div>

      {/* Topic Detail Modal */}
      {viewingTopic && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="p-8 overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{viewingTopic.title}</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">摘要</h4>
                  <p className="text-gray-700 leading-relaxed text-lg">{viewingTopic.overview}</p>
                </div>

                {viewingTopic.fullDetail && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">推荐理由</h4>
                    <p className="text-gray-600 leading-relaxed">{viewingTopic.fullDetail}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={closeTopicDetail}
                className="px-6 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={confirmTopicFromModal}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-colors flex items-center gap-2"
              >
                <CheckCircle2 size={18} />
                选择此题目
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};