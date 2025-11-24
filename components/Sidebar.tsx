import React, { useState } from 'react';
import { PaperTask } from '../types';
import { 
  Plus, 
  MessageSquare, 
  MoreVertical, 
  Settings, 
  Menu,
  Pin
} from 'lucide-react';

interface SidebarProps {
  tasks: PaperTask[];
  activeTaskId: string | null;
  onSelectTask: (id: string) => void;
  onAddTask: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ tasks, activeTaskId, onSelectTask, onAddTask }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-16 items-center' : 'w-64'} h-full bg-[#f0f4f9] text-[#1f1f1f] flex flex-col font-sans border-r border-transparent transition-all duration-300 ease-in-out`}>
      {/* Header Section */}
      <div className={`pt-4 ${isCollapsed ? 'px-0 items-center' : 'px-4'} pb-2 flex flex-col gap-4`}>
        <div className={isCollapsed ? 'flex justify-center w-full' : ''}>
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="p-3 hover:bg-[#e2e7eb] rounded-full text-[#444746] transition-colors"
           >
             <Menu size={24} />
           </button>
        </div>
        
        <div className={isCollapsed ? 'flex justify-center w-full' : ''}>
          <button 
            onClick={onAddTask}
            className={`
              flex items-center gap-3 bg-[#dde3ea] hover:bg-[#d3dbe5] text-[#1f1f1f] transition-colors shadow-sm group
              ${isCollapsed ? 'p-3 rounded-full justify-center' : 'px-4 py-3 rounded-[16px] w-fit pr-6'}
            `}
            title={isCollapsed ? "新建论文" : undefined}
          >
            <Plus size={24} className="text-[#444746] group-hover:text-black" />
            {!isCollapsed && <span className="font-medium text-sm text-[#444746] group-hover:text-black">新建论文</span>}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {!isCollapsed && (
        <>
          {/* Recent List Section */}
          <div className="flex-1 overflow-y-auto mt-4 px-3 custom-scrollbar animate-fade-in">
            <div className="px-4 py-2 text-xs font-medium text-[#444746]">最近</div>
            <div className="space-y-0.5">
              {tasks.map((task, index) => {
                 const isActive = activeTaskId === task.id;
                 const isPinned = index === 0; 
                 
                 return (
                  <button
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm text-left transition-colors relative
                      ${isActive ? 'bg-[#c2e7ff] text-[#001d35] font-medium' : 'text-[#444746] hover:bg-[#e2e7eb]'}
                    `}
                  >
                    <MessageSquare size={16} className={`shrink-0 ${isActive ? 'text-[#001d35]' : 'text-[#444746]'}`} />
                    <span className="truncate flex-1">{task.title || "未命名论文"}</span>
                    
                    {/* Pinned Icon (Visual only) */}
                    {isPinned && !isActive && (
                       <Pin size={14} className="text-[#444746] shrink-0" />
                    )}
                    
                    {/* Hover Menu */}
                    <div className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-[#001d35]' : 'text-[#444746]'}`}>
                        <MoreVertical size={16} />
                    </div>
                  </button>
                 );
              })}
            </div>
          </div>

          {/* Footer Section */}
          <div className="p-3 mt-auto space-y-0.5 animate-fade-in">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-[#e2e7eb] text-sm text-[#444746] transition-colors font-medium">
                <Settings size={18} />
                <span>设置</span>
            </button>
            
            <div className="px-4 py-2 flex items-center gap-2 text-[11px] text-[#444746] font-medium mt-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                 DeepWrite • 北京
            </div>
          </div>
        </>
      )}
    </div>
  );
};