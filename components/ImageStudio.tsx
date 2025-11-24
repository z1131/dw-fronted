import React, { useState } from 'react';
import { ImageSize } from '../types';
import { X, Image as ImageIcon, Wand2, Download, AlertCircle } from 'lucide-react';
import { generateThesisImage, editThesisImage } from '../services/geminiService';

interface ImageStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // Edit mode state
  const [editBase64, setEditBase64] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResultImage(null);
    try {
      const imgData = await generateThesisImage(prompt, size);
      setResultImage(imgData);
    } catch (e) {
      alert("生成图片失败");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editBase64 || !prompt) return;
    setLoading(true);
    setResultImage(null);
    try {
        const imgData = await editThesisImage(editBase64, prompt);
        setResultImage(imgData);
    } catch (e) {
        alert("图片编辑失败");
    } finally {
        setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditBase64(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <ImageIcon className="text-blue-400" />
                <h2 className="text-xl font-bold">配图工作室 (Nano Banana)</h2>
            </div>
            <button onClick={onClose} className="hover:text-red-400 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
            {/* Controls */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 flex flex-col overflow-y-auto">
                <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
                    <button 
                        onClick={() => { setActiveTab('generate'); setPrompt(''); setResultImage(null); }}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'generate' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        生成
                    </button>
                    <button 
                        onClick={() => { setActiveTab('edit'); setPrompt(''); setResultImage(null); }}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'edit' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        编辑
                    </button>
                </div>

                <div className="space-y-4 flex-1">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">提示词</label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={activeTab === 'generate' ? "描述科学图表或插图..." : "描述修改要求 (例如：'添加红色复古滤镜')"}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    {activeTab === 'generate' && (
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">质量</label>
                             <div className="grid grid-cols-3 gap-2">
                                {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSize(s)}
                                        className={`py-2 text-sm border rounded hover:bg-blue-50 ${size === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                             </div>
                             <p className="text-xs text-gray-400 mt-2 flex items-start gap-1">
                                <AlertCircle size={12} className="mt-0.5" />
                                支持 1K, 2K, 4K (Gemini 3 Pro)
                             </p>
                        </div>
                    )}

                    {activeTab === 'edit' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">原图</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden">
                                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                {editBase64 ? (
                                    <img src={editBase64} alt="Preview" className="h-32 object-contain mx-auto" />
                                ) : (
                                    <div className="text-gray-400 text-sm">点击上传</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={activeTab === 'generate' ? handleGenerate : handleEdit}
                    disabled={loading || !prompt || (activeTab === 'edit' && !editBase64)}
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Wand2 className="animate-spin" /> : <Wand2 />}
                    {activeTab === 'generate' ? '开始生成' : '应用编辑'}
                </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 relative">
                <div className="absolute inset-0 pattern-grid opacity-10 pointer-events-none"></div> {/* Placeholder pattern */}
                
                {resultImage ? (
                    <div className="relative group max-h-full max-w-full">
                        <img src={resultImage} alt="Result" className="max-h-[60vh] rounded-lg shadow-lg border-4 border-white" />
                        <a 
                            href={resultImage} 
                            download="deepwrite-image.png"
                            className="absolute bottom-4 right-4 bg-white text-slate-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600"
                        >
                            <Download />
                        </a>
                    </div>
                ) : (
                    <div className="text-slate-400 text-center">
                        <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                        <p>生成的图片将在此显示</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};