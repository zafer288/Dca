import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { ChevronRight, Terminal } from 'lucide-react';

interface SystemLogsProps {
  logs: LogEntry[];
}

const SystemLogs: React.FC<SystemLogsProps> = ({ logs = [] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLogCountRef = useRef(0);

  useEffect(() => {
    const logCount = logs?.length || 0;
    if (logCount > prevLogCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevLogCountRef.current = logCount;
    } else if (prevLogCountRef.current === 0 && logCount > 0) {
       bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
       prevLogCountRef.current = logCount;
    }
  }, [logs]);

  const getColor = (level: LogEntry['level']) => {
    switch(level) {
      case 'SUCCESS': return 'text-emerald-500';
      case 'WARNING': return 'text-amber-500';
      case 'ERROR': return 'text-rose-500';
      default: return 'text-indigo-400';
    }
  };

  return (
    <div className="bg-[#09090b] rounded-sm border border-white/5 flex flex-col h-[300px] font-mono overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-black border-b border-white/5">
        <div className="flex items-center gap-3">
           <Terminal size={14} className="text-zinc-600" />
           <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">SİSTEM OLAY AKIŞI</span>
        </div>
        <div className="flex gap-1.5 opacity-30">
           <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
           <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
           <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-2 scrollbar-none">
        {(!logs || logs.length === 0) ? (
          <div className="text-zinc-800 text-[11px] uppercase tracking-widest font-bold">VERİ AKIŞI BEKLENİYOR...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-[12px] group py-0.5">
              <span className="text-zinc-700 shrink-0 select-none font-bold">[{new Date(log.timestamp).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})}]</span>
              <ChevronRight size={12} className={`mt-0.5 shrink-0 opacity-40 ${getColor(log.level)}`} />
              <span className={`break-all font-medium ${log.level === 'INFO' ? 'text-zinc-500' : getColor(log.level)}`}>
                 {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default SystemLogs;