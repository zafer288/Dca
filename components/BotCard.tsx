import React from 'react';
import { BotConfig } from '../types';
import { Play, Pause, Trash2, Code, Activity, Wallet, Zap } from 'lucide-react';

interface BotCardProps {
  bot: BotConfig;
  onToggle: (id: string, currentState: boolean) => void;
  onDelete: (id: string) => void;
  onShowWebhook: (bot: BotConfig) => void;
}

const BotCard: React.FC<BotCardProps> = ({ bot, onToggle, onDelete, onShowWebhook }) => {
  const isBuy = bot.side === 'BUY';
  const accentColor = isBuy ? 'text-emerald-400' : 'text-rose-400';
  const bgAccent = isBuy ? 'bg-emerald-500' : 'bg-rose-500';

  let unrealizedPnL = 0;
  let unrealizedPnLPercent = 0;
  
  const currentPrice = bot.current_price || 0;
  const entryPrice = bot.entry_price || 0;
  const leverage = bot.leverage || 1;
  const quantity = bot.last_order_info?.quantity || 0;

  if (bot.has_open_position && entryPrice > 0 && currentPrice > 0 && bot.last_order_info) {
    const diff = isBuy ? (currentPrice - entryPrice) : (entryPrice - currentPrice);
    unrealizedPnL = diff * quantity;
    unrealizedPnLPercent = (diff / entryPrice) * 100 * leverage;
  }

  const pnlIsPositive = unrealizedPnL >= 0;
  const pnlColor = pnlIsPositive ? 'text-emerald-400' : 'text-rose-400';
  const realizedPnL = bot.total_realized_pnl || 0;

  return (
    <div className="relative bg-[#09090b] border border-white/5 rounded-sm overflow-hidden hover:border-white/10 transition-colors p-4">
      {/* Active Indicator Line */}
      <div className={`absolute top-0 left-0 w-0.5 h-full ${bot.is_active ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-zinc-800'}`}></div>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono">{bot.symbol}</h3>
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-sm border border-white/5 ${bgAccent}/10 ${accentColor}`}>
                  {isLong(bot) ? 'LONG' : 'SHORT'} {leverage}x
                </span>
             </div>
             
             <div className="flex items-center gap-2 text-[10px] text-zinc-500">
               <span className="font-mono text-zinc-600">{bot.bot_id.split('_')[0]}</span>
               <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
               <div className="flex items-center gap-1 uppercase font-bold tracking-tighter text-[9px]">
                 <Wallet size={10} className="text-zinc-600" /> {bot.accountName || 'MAIN'}
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => onShowWebhook(bot)} 
              className="w-9 h-9 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 rounded-sm text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
            >
              <Code size={16} />
            </button>
            <button 
              onClick={() => onToggle(bot.bot_id, bot.is_active)} 
              className={`w-9 h-9 flex items-center justify-center rounded-sm border border-white/5 transition-all ${bot.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-900 text-zinc-700'}`}
            >
              {bot.is_active ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={() => onDelete(bot.bot_id)} className="w-9 h-9 flex items-center justify-center bg-zinc-900/50 border border-white/5 rounded-sm text-zinc-700 hover:text-rose-500 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* PnL Section */}
        <div className="bg-black/50 border border-white/5 rounded-sm px-4 py-3">
           {bot.has_open_position ? (
              <div className="flex items-center justify-between">
                 <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Açık PnL</span>
                 <div className="flex items-center gap-3">
                    <span className={`text-lg font-mono font-bold ${pnlColor}`}>
                       ${unrealizedPnL.toFixed(2)}
                    </span>
                    <span className={`text-[11px] font-bold font-mono ${pnlColor} px-1.5 py-0.5 bg-white/5 rounded-sm`}>
                       {unrealizedPnLPercent.toFixed(2)}%
                    </span>
                 </div>
              </div>
           ) : (
              <div className="flex items-center justify-between opacity-30">
                 <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Sinyal Bekleniyor</span>
                 <Activity size={14} className="text-zinc-700 animate-pulse" />
              </div>
           )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-sm overflow-hidden">
           <div className="bg-black/40 p-2 text-center">
              <span className="text-[8px] text-zinc-600 uppercase font-black block mb-1">MİKTAR</span>
              <span className="text-[11px] text-zinc-400 font-mono">${bot.order_amount}</span>
           </div>
           
           <div className="bg-black/40 p-2 text-center">
              <span className="text-[8px] text-zinc-600 uppercase font-black block mb-1">GİRİŞ</span>
              <span className="text-[11px] text-zinc-400 font-mono">
                 {entryPrice > 0 ? entryPrice.toFixed(entryPrice > 100 ? 1 : 4) : '-'}
              </span>
           </div>

           <div className="bg-black/40 p-2 text-center">
              <span className="text-[8px] text-zinc-600 uppercase font-black block mb-1">REALİZE</span>
              <span className={`text-[11px] font-mono font-bold ${realizedPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {realizedPnL.toFixed(2)}
              </span>
           </div>

           <div className="bg-black/40 p-2 text-center">
              <span className="text-[8px] text-zinc-600 uppercase font-black block mb-1">TP/SL</span>
              <span className="text-[11px] text-zinc-400 font-mono">
                 {bot.take_profit}% / {bot.stop_loss}%
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};

const isLong = (bot: BotConfig) => bot.side === 'BUY';

export default BotCard;