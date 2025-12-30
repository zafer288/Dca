import React, { useState, useEffect } from 'react';
import { X, Wallet, Shield, Trash2, RefreshCw, Globe, Link } from 'lucide-react';
import { api } from '../services/api';
import { ExchangeAccount } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  
  const [accounts, setAccounts] = useState<ExchangeAccount[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);
  
  const [newAccount, setNewAccount] = useState<Omit<ExchangeAccount, 'id'>>({ 
    name: '', 
    exchange: 'BINANCE', 
    apiKey: '', 
    apiSecret: '' 
  });

  useEffect(() => {
    if (isOpen) loadConfig();
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const data = await api.getConfig();
      if (data) {
        if (data.accounts) setAccounts(data.accounts);
        if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
      }
    } catch (e) { console.error(e); }
  };

  const handleSaveGlobal = async () => {
    setLoading(true);
    try {
      await api.updateConfig({ 
        accounts,
        webhookUrl: webhookUrl.trim()
      });
      setLoading(false);
      alert("✅ Ayarlar başarıyla kaydedildi.");
      onClose();
    } catch (err: any) {
      setLoading(false); 
      alert(`❌ Kayıt Hatası: ${err.message}`);
    }
  };

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.apiKey || !newAccount.apiSecret) return;
    setAccounts([...accounts, { ...newAccount, id: `acc_${Date.now()}` }]);
    setNewAccount({ name: '', exchange: 'BINANCE', apiKey: '', apiSecret: '' });
    setShowAddAccount(false);
  };

  if (!isOpen) return null;

  const inputClass = "w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-white font-mono text-sm focus:border-indigo-500 outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4">
      <div className="bg-[#09090b] rounded-sm border border-white/10 shadow-2xl w-full max-w-2xl flex flex-col h-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Shield className="text-white" size={20} />
            <h2 className="text-white font-bold text-lg uppercase tracking-wide">Sistem Ayarları</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#050505]">
          <div className="space-y-8">
            
            {/* Webhook Settings Section */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <Globe size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Webhook Sunucu Ayarları</span>
               </div>
               
               <div className="bg-[#0c0c0e] border border-white/5 p-4 rounded-sm space-y-3">
                  <label className="block text-[10px] text-zinc-500 uppercase font-bold">Webhook URL (TradingView Hedef Adresi)</label>
                  <div className="relative">
                    <input 
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://uygulamaniz.run.app/api/webhook"
                      className={`${inputClass} pl-10`}
                    />
                    <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  </div>
                  <p className="text-[10px] text-zinc-600 leading-relaxed">
                    Cloud Run üzerinde oluşturduğunuz URL'yi buraya yapıştırın. TradingView alarmları bu adrese gönderilecektir.
                  </p>
               </div>
            </div>

            <div className="w-full h-px bg-white/5"></div>

            {/* API Keys Section */}
            <div className="space-y-4">
              <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-sm flex items-start gap-3">
                  <Wallet size={18} className="text-indigo-400 mt-0.5" />
                  <p className="text-[11px] text-indigo-300/80 leading-relaxed uppercase font-bold">
                    Borsa API anahtarlarınızı buradan yönetin. (Simülasyon Modu Aktif)
                  </p>
              </div>

              <div className="space-y-2">
                  {accounts.map(acc => (
                    <div key={acc.id} className="flex items-center justify-between p-4 bg-black border border-white/5 rounded-sm group">
                      <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                         {acc.name} <span className="text-zinc-500">({acc.exchange})</span>
                      </span>
                      <button onClick={() => setAccounts(accounts.filter(a => a.id !== acc.id))} className="text-zinc-600 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  {accounts.length === 0 && (
                     <div className="text-center py-6 border border-dashed border-white/10 rounded-sm text-zinc-600 text-xs uppercase font-bold">Hesap Eklenmedi</div>
                  )}
              </div>

              {showAddAccount ? (
                <div className="p-4 border border-white/10 bg-black rounded-sm space-y-4 animate-in slide-in-from-top-2">
                  <input placeholder="Takma Ad (Örn: Binance Ana)" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} className={inputClass} />
                  <input placeholder="API Key" value={newAccount.apiKey} onChange={e => setNewAccount({...newAccount, apiKey: e.target.value})} className={inputClass} />
                  <input placeholder="API Secret" value={newAccount.apiSecret} onChange={e => setNewAccount({...newAccount, apiSecret: e.target.value})} className={inputClass} />
                  <div className="flex gap-2">
                     <button onClick={() => setShowAddAccount(false)} className="flex-1 py-3 border border-white/10 text-zinc-400 font-bold text-xs uppercase rounded-sm hover:text-white">İptal</button>
                     <button onClick={handleAddAccount} className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase rounded-sm transition-colors">Hesabı Ekle</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddAccount(true)} className="w-full py-4 border border-dashed border-white/10 text-zinc-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all text-[10px] font-bold uppercase rounded-sm">
                  + Yeni Borsa Hesabı Bağla
                </button>
              )}
            </div>

            <button onClick={handleSaveGlobal} disabled={loading} className="w-full bg-white hover:bg-zinc-200 text-black py-4 font-bold text-xs uppercase rounded-sm flex items-center justify-center gap-2 mt-4 transition-colors">
              {loading && <RefreshCw className="animate-spin" size={16} />} Ayarları Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;