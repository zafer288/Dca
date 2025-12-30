
import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Wallet, Zap } from 'lucide-react';
import { BotConfig, ExchangeAccount } from '../types';
import { api } from '../services/api';

interface CreateBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: Partial<BotConfig>) => void;
}

const InputLabel = ({ children }: { children?: React.ReactNode }) => (
  <label className="block text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1.5">{children}</label>
);

const CreateBotModal: React.FC<CreateBotModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const DEFAULT_SYMBOL = 'BTCUSDT';
  const DEFAULT_SIDE = 'BUY';

  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<ExchangeAccount[]>([]);
  
  const [formData, setFormData] = useState({
    bot_id: `${DEFAULT_SYMBOL}_${DEFAULT_SIDE}_BOT`,
    accountId: '',
    symbol: DEFAULT_SYMBOL,
    side: DEFAULT_SIDE,
    order_type: 'MARKET' as 'MARKET' | 'LIMIT',
    leverage: 1,
    order_amount: 10,
    stop_loss: 0,
    take_profit: 0
  });

  useEffect(() => {
    if (isOpen) {
        api.getSymbols().then(setAvailableSymbols).catch(() => setAvailableSymbols(['BTCUSDT', 'ETHUSDT']));
        api.getConfig().then(config => {
          if (config && config.accounts) {
            setAccounts(config.accounts);
            if (config.accounts.length > 0) {
              setFormData(prev => ({ ...prev, accountId: config.accounts[0].id }));
            }
          }
        }).catch(e => console.error("Config load error", e));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateBotId = (symbol: string, side: string) => {
    return `${symbol}_${side}_BOT`;
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSymbol = e.target.value.toUpperCase();
    setFormData(prev => ({
      ...prev,
      symbol: newSymbol,
      bot_id: generateBotId(newSymbol, prev.side)
    }));
  };

  const handleSideChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSide = e.target.value;
    setFormData(prev => ({
      ...prev,
      side: newSide,
      bot_id: generateBotId(prev.symbol, newSide)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId) {
      alert("Lütfen önce ayarlardan bir borsa hesabı ekleyin!");
      return;
    }

    onSubmit({
      ...formData,
      side: formData.side as 'BUY' | 'SELL',
      order_type: 'MARKET',
      leverage: Number(formData.leverage),
      order_amount: Number(formData.order_amount),
      stop_loss: Number(formData.stop_loss),
      take_profit: Number(formData.take_profit)
    });
    onClose();
  };

  const inputClass = "w-full bg-[#050505] border border-white/10 rounded-sm px-3 py-2 text-xs text-white font-mono focus:border-indigo-500/50 outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#09090b] w-full max-w-md border border-white/10 rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-zinc-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Yeni Market Birimi</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          <div className="bg-indigo-900/10 border border-indigo-500/20 p-3 rounded-sm mb-4">
             <div className="flex items-center gap-2 mb-2">
                <Wallet size={12} className="text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-300 uppercase">Hesap Seçimi</span>
             </div>
             {accounts.length > 0 ? (
               <select 
                  value={formData.accountId}
                  onChange={e => setFormData({...formData, accountId: e.target.value})}
                  className="w-full bg-black border border-indigo-500/30 rounded-sm px-2 py-2 text-xs text-white outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.exchange})</option>
                  ))}
               </select>
             ) : (
               <div className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-sm border border-rose-500/20">
                  Ayarlardan hesap eklemelisiniz!
               </div>
             )}
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 p-2 rounded-sm flex items-center gap-2">
             <Zap size={14} className="text-amber-500" />
             <span className="text-[10px] text-amber-500 font-bold uppercase">Emir Tipi: Market (Anında Uygulama)</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel>Sembol</InputLabel>
              <input 
                type="text" 
                list="symbols"
                value={formData.symbol}
                onChange={handleSymbolChange}
                className={inputClass}
                placeholder="BTCUSDT"
              />
              <datalist id="symbols">
                {availableSymbols.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <InputLabel>Yön</InputLabel>
              <select 
                value={formData.side}
                onChange={handleSideChange}
                className={inputClass}
              >
                <option value="BUY">LONG</option>
                <option value="SELL">SHORT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel>Miktar (USD)</InputLabel>
              <input 
                type="number"
                inputMode="decimal"
                step="any"
                value={formData.order_amount}
                onChange={e => setFormData({...formData, order_amount: Number(e.target.value)})}
                className={inputClass}
                min="10"
              />
            </div>
            <div>
              <InputLabel>Kaldıraç (x)</InputLabel>
              <input 
                type="number"
                inputMode="numeric"
                value={formData.leverage}
                onChange={e => setFormData({...formData, leverage: Number(e.target.value)})}
                className={inputClass}
                min="1"
                max="125"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <InputLabel>Kâr Al (%)</InputLabel>
              <input 
                type="number" 
                inputMode="decimal"
                step="any"
                value={formData.take_profit}
                onChange={e => setFormData({...formData, take_profit: Number(e.target.value)})}
                className={inputClass}
              />
            </div>
            <div>
              <InputLabel>Zarar Kes (%)</InputLabel>
              <input 
                type="number" 
                inputMode="decimal"
                step="any"
                value={formData.stop_loss}
                onChange={e => setFormData({...formData, stop_loss: Number(e.target.value)})}
                className={inputClass}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 border border-white/10 text-zinc-400 hover:text-white text-xs font-bold uppercase rounded-sm transition-colors"
            >
              İptal
            </button>
            <button 
              type="submit"
              disabled={accounts.length === 0}
              className="flex-[2] py-2.5 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 text-xs font-bold uppercase rounded-sm transition-colors"
            >
              Market Botu Başlat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBotModal;
