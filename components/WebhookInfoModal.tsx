import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Zap, LogIn, LogOut, BellRing, Settings2 } from 'lucide-react';
import { BotConfig } from '../types';
import { api } from '../services/api';

interface WebhookInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: BotConfig | null;
}

type TabType = 'JSON' | 'PINE_SCRIPT';
type SignalType = 'ENTRY' | 'EXIT';

const WebhookInfoModal: React.FC<WebhookInfoModalProps> = ({ isOpen, onClose, bot }) => {
  const [passphrase, setPassphrase] = useState('');
  const [webhookUrl, setWebhookUrl] = useState("http://localhost:8080/webhook"); 
  const [copied, setCopied] = useState<string | null>(null);
  
  const [mainTab, setMainTab] = useState<TabType>('JSON');
  const [signalTab, setSignalTab] = useState<SignalType>('ENTRY');

  useEffect(() => {
    if (isOpen) {
      api.getConfig().then(config => {
        if (config) {
          setPassphrase(config.webhookPassphrase || 'binance_secure');
          if (config.webhookUrl) {
            setWebhookUrl(config.webhookUrl);
          }
        }
      }).catch(e => console.error("Config load error", e));
      setMainTab('JSON');
      setSignalTab('ENTRY');
    }
  }, [isOpen]);

  if (!isOpen || !bot) return null;

  const isLong = bot.side === 'BUY';

  // --- JSON GENERATION ---
  const jsonMessage = JSON.stringify({
    bot_id: bot.bot_id,
    passphrase: passphrase,
    action: signalTab === 'ENTRY' ? 'entry' : 'exit'
  }, null, 2);

  const entryJsonOneLine = JSON.stringify({
    bot_id: bot.bot_id,
    passphrase: passphrase,
    action: 'entry'
  }).replace(/"/g, '\\"');
  
  const exitJsonOneLine = JSON.stringify({
    bot_id: bot.bot_id,
    passphrase: passphrase,
    action: 'exit'
  }).replace(/"/g, '\\"');

  const pineScriptCode = `//@version=5
strategy("DCA Bot - ${bot.bot_id}", overlay=true)
var entryMsg = "${entryJsonOneLine}"
var exitMsg = "${exitJsonOneLine}"
// ... indikatör kodlarınız ...
if (buy_condition)
    strategy.entry("Entry", strategy.long, alert_message=entryMsg)
if (sell_condition)
    strategy.close("Entry", alert_message=exitMsg)`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#09090b] rounded-sm border border-white/10 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#09090b] shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2 uppercase tracking-tighter">
              <Zap size={20} className="text-amber-500 fill-amber-500" />
              TradingView Entegrasyon
            </h2>
            <p className="text-zinc-500 text-[10px] font-mono mt-1 uppercase">
              Birim: <span className="text-indigo-400 font-bold">{bot.symbol}</span> | ID: <span className="text-white">{bot.bot_id}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          {/* HELP BOX */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-sm">
             <div className="flex items-start gap-3">
                 <div className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold mt-0.5">!</div>
                 <div>
                   <h4 className="text-white text-[11px] font-bold uppercase mb-2">Kurulum Bilgisi</h4>
                   <p className="text-[10px] text-zinc-400 leading-relaxed">
                     Aşağıdaki Webhook URL'sini TradingView alarm ayarlarınızdaki "Webhook URL" kısmına yapıştırın. Mesaj kutusundaki JSON verisini ise "Message" kutusuna kopyalayın.
                   </p>
                 </div>
             </div>
          </div>

          {/* 1. ADIM: URL */}
          <div className="space-y-3">
            <label className="block text-white text-[10px] uppercase font-bold flex items-center gap-2">
              <span className="w-5 h-5 bg-white text-black flex items-center justify-center rounded-full text-[9px]">1</span>
              Webhook URL (Hedef Adres)
            </label>
            <div className="bg-black border border-white/10 rounded-sm p-4 flex items-center justify-between group transition-colors">
              <code className="font-mono text-sm text-emerald-400 break-all">
                {webhookUrl}
              </code>
              <button 
                onClick={() => copyToClipboard(webhookUrl, 'url')}
                className="ml-3 p-2 bg-white/5 hover:bg-white/10 rounded-sm transition-colors text-zinc-400 hover:text-white shrink-0"
              >
                {copied === 'url' ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-[9px] text-zinc-600 italic">* Bu adresi sağ üstteki Ayarlar menüsünden değiştirebilirsiniz.</p>
          </div>

          {/* 2. ADIM: MESSAGE */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <div className="flex items-center justify-between">
               <label className="block text-white text-[10px] uppercase font-bold flex items-center gap-2">
                 <span className="w-5 h-5 bg-white text-black flex items-center justify-center rounded-full text-[9px]">2</span>
                 Mesaj İçeriği
               </label>

               <div className="flex bg-black rounded-sm border border-white/10 p-0.5">
                  <button onClick={() => setMainTab('JSON')} className={`px-4 py-1.5 text-[9px] font-bold uppercase rounded-sm transition-all ${mainTab === 'JSON' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Manuel Alarm</button>
                  <button onClick={() => setMainTab('PINE_SCRIPT')} className={`px-4 py-1.5 text-[9px] font-bold uppercase rounded-sm transition-all ${mainTab === 'PINE_SCRIPT' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Pine Script (Kod)</button>
               </div>
            </div>

            {mainTab === 'JSON' ? (
              <div className="space-y-4">
                <div className="flex bg-black p-1 rounded-sm border border-white/10">
                  <button onClick={() => setSignalTab('ENTRY')} className={`flex-1 py-2.5 text-[10px] font-bold rounded-sm flex items-center justify-center gap-2 transition-all ${signalTab === 'ENTRY' ? (isLong ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'text-zinc-600'}`}>
                    <LogIn size={14} /> {isLong ? 'LONG GİRİŞ' : 'SHORT GİRİŞ'}
                  </button>
                  <button onClick={() => setSignalTab('EXIT')} className={`flex-1 py-2.5 text-[10px] font-bold rounded-sm flex items-center justify-center gap-2 transition-all ${signalTab === 'EXIT' ? 'bg-amber-600 text-white' : 'text-zinc-600'}`}>
                    <LogOut size={14} /> POZİSYON KAPAT
                  </button>
                </div>

                <div className="relative bg-black border border-white/10 rounded-sm p-5 group shadow-inner">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {copied === 'json' && <span className="text-[9px] text-emerald-500 font-bold uppercase animate-in fade-in slide-in-from-right-2">Kopyalandı!</span>}
                    <button onClick={() => copyToClipboard(jsonMessage, 'json')} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-sm text-zinc-400 transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                  <pre className="text-zinc-300 font-mono text-xs overflow-x-auto leading-relaxed">{jsonMessage}</pre>
                </div>
              </div>
            ) : (
              <div className="relative bg-black border border-white/10 rounded-sm p-5 group">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {copied === 'pine' && <span className="text-[9px] text-emerald-500 font-bold uppercase">Kopyalandı!</span>}
                  <button onClick={() => copyToClipboard(pineScriptCode, 'pine')} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-sm text-zinc-400 transition-colors">
                    <Copy size={16} />
                  </button>
                </div>
                <pre className="text-zinc-400 font-mono text-[10px] overflow-x-auto leading-tight">{pineScriptCode}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookInfoModal;