import React, { useEffect, useState } from 'react';
import { BotConfig, LogEntry, GlobalStats } from './types';
import { api } from './services/api';
import BotCard from './components/BotCard';
import CreateBotModal from './components/CreateBotModal';
import SettingsModal from './components/SettingsModal';
import WebhookInfoModal from './components/WebhookInfoModal';
import SystemLogs from './components/SystemLogs';
import { 
  Plus, 
  Settings,
  Zap,
  TrendingUp,
  RefreshCw,
  MousePointer2,
  Hexagon,
  LayoutDashboard
} from 'lucide-react';

export default function App() {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<GlobalStats>({ pnl_24h: 0, pnl_all_time: 0, active_bots: 0, total_volume: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);
  const [activeBotId, setActiveBotId] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const fetchData = async () => {
    try {
      const [fetchedBots, fetchedLogs, fetchedStats] = await Promise.all([
        api.getBots(),
        api.getLogs(),
        api.getStats()
      ]);
      
      setBots(Array.isArray(fetchedBots) ? fetchedBots : []);
      setLogs(Array.isArray(fetchedLogs) ? fetchedLogs : []);
      setStats(fetchedStats || { pnl_24h: 0, pnl_all_time: 0, active_bots: 0, total_volume: 0 });
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000); 
    return () => clearInterval(interval);
  }, []);

  const handleManualOrder = async (action: 'entry' | 'exit') => {
    if (!activeBotId) return;
    setIsExecuting(true);
    try {
      const config = await api.getConfig();
      await api.simulateWebhook(activeBotId, config.webhookPassphrase, action);
      await fetchData();
    } catch (e: any) {
      alert(`İşlem Hatası: ${e.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 flex flex-col antialiased font-sans selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <nav className="h-16 sm:h-20 flex items-center border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white flex items-center justify-center rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <Hexagon size={18} className="text-black fill-black sm:w-5 sm:h-5" strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg tracking-wider text-white leading-none">DCA BOT</span>
              <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono mt-0.5 sm:mt-1 tracking-[0.2em] uppercase">
                BINANCE FUTURES v2.5
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-sm bg-[#121214] border border-white/5 text-zinc-400 hover:text-white transition-all active:scale-95 hover:border-white/20"
          >
            <Settings size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-32">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-[#09090b] border border-white/5 p-4 sm:p-5 rounded-sm flex flex-col justify-between h-28 sm:h-32">
               <span className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">AKTİF BİRİMLER</span>
               <div className="text-3xl sm:text-5xl font-mono text-white tracking-tighter">
                 {(bots || []).length.toString().padStart(2, '0')}
               </div>
            </div>
            <div className="bg-[#09090b] border border-white/5 p-4 sm:p-5 rounded-sm flex flex-col justify-between h-28 sm:h-32">
               <span className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">24S PNL</span>
               <div className={`text-3xl sm:text-5xl font-mono tracking-tighter ${(stats?.pnl_24h ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                 ${(stats?.pnl_24h ?? 0).toFixed(2)}
               </div>
            </div>
            <div className="bg-[#09090b] border border-white/5 p-4 sm:p-5 rounded-sm col-span-2 flex flex-col justify-center h-20 sm:h-24">
               <span className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">TOPLAM İŞLEM HACMİ (BİNANCE)</span>
               <div className="text-xl sm:text-3xl font-mono text-indigo-400 tracking-tight">
                 ${(stats?.total_volume || 0).toLocaleString()}
               </div>
            </div>
        </div>

        {/* Manual Action Panel */}
        <div className="bg-[#0c0c0e] border border-white/10 p-5 sm:p-6 rounded-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Zap size={100} />
          </div>
          
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
             <div className="p-1.5 sm:p-2 bg-amber-500/10 rounded-sm">
               <Zap size={14} className="text-amber-500 fill-amber-500 sm:w-4 sm:h-4" />
             </div>
             <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest">HIZLI MANUEL İŞLEM</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[9px] sm:text-[10px] text-zinc-500 uppercase font-black tracking-widest">HEDEF BİRİM SEÇİMİ</label>
              <div className="relative">
                <select 
                  className="w-full h-10 sm:h-12 bg-black border border-white/10 rounded-sm px-4 text-xs text-zinc-300 font-mono focus:border-indigo-500/50 outline-none appearance-none transition-colors"
                  value={activeBotId}
                  onChange={(e) => setActiveBotId(e.target.value)}
                >
                  <option value="">Bot Seçiniz...</option>
                  {Array.isArray(bots) && bots.map(b => (
                    <option key={b.bot_id} value={b.bot_id}>{b.symbol} :: {b.bot_id.split('_')[0]}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                  <MousePointer2 size={14} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleManualOrder('entry')}
                disabled={!activeBotId || isExecuting}
                className="h-12 sm:h-14 bg-[#051f16] hover:bg-[#082b20] disabled:opacity-30 border border-emerald-500/20 text-emerald-500 text-[10px] sm:text-xs font-black uppercase rounded-sm transition-all flex items-center justify-center gap-2"
              >
                {isExecuting ? <RefreshCw className="animate-spin" size={14} /> : <TrendingUp size={14} className="sm:w-4 sm:h-4" />}
                MARKET AL / GİRİŞ
              </button>
              <button 
                onClick={() => handleManualOrder('exit')}
                disabled={!activeBotId || isExecuting}
                className="h-12 sm:h-14 bg-[#21090d] hover:bg-[#330d13] disabled:opacity-30 border border-rose-500/20 text-rose-500 text-[10px] sm:text-xs font-black uppercase rounded-sm transition-all flex items-center justify-center gap-2"
              >
                {isExecuting ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} className="sm:w-4 sm:h-4" />}
                MARKET SAT / KAPAT
              </button>
            </div>
          </div>
        </div>

        {/* Bot List Header */}
        <div className="flex items-center justify-between pt-2 sm:pt-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={14} className="text-zinc-500 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">BİNANCE AKTİF BİRİMLER</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase rounded-sm hover:bg-zinc-200 transition-colors"
          >
            <Plus size={12} /> <span className="hidden sm:inline">YENİ BOT</span>
          </button>
        </div>
        
        {/* Bot List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(bots) && bots.map(bot => (
              <BotCard 
                key={bot.bot_id} 
                bot={bot} 
                onToggle={(id, state) => api.toggleBot(id, !state).then(fetchData)}
                onDelete={(id) => api.deleteBot(id).then(fetchData)}
                onShowWebhook={setSelectedBot}
              />
            ))}
            {(!Array.isArray(bots) || bots.length === 0) && !isLoading && (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10 bg-[#09090b]/40 rounded-sm">
                <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">AKTİF BİRİM BULUNAMADI</span>
              </div>
            )}
        </div>

        <SystemLogs logs={logs} />
      </main>

      <CreateBotModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={(c) => api.createBot(c).then(fetchData)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {selectedBot && <WebhookInfoModal isOpen={!!selectedBot} onClose={() => setSelectedBot(null)} bot={selectedBot} />}
    </div>
  );
}