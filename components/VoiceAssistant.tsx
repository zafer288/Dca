import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BotConfig, GlobalStats } from '../types';
import { Sparkles, Send, Loader2, BrainCircuit, X, MessageSquare, ShieldCheck, Zap } from 'lucide-react';

interface VoiceAssistantProps {
  bots: BotConfig[];
  stats: GlobalStats;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ bots, stats }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const analyzeMarket = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setIsThinking(true);
    setResponse(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const prompt = `
        Sen profesyonel bir kripto para ticaret botu ve DCA strateji analistisin. 
        Mevcut Kullanıcı Portföy Durumu:
        - Aktif Birim Sayısı: ${bots.length}
        - Toplam Ticaret Hacmi: $${stats.total_volume}
        - 24 Saatlik PnL: $${stats.pnl_24h}
        - Aktif Pozisyonlar: ${bots.filter(b => b.has_open_position).map(b => `${b.symbol} (${b.side})`).join(', ') || 'Yok'}
        
        Kullanıcı Sorusu: "${query}"
        
        Talimatlar:
        1. Yanıtın teknik, profesyonel ve kısa olmalı.
        2. Finansal tavsiye vermediğini belirten bir dil kullanma (zaten biliyoruz), doğrudan analize odaklan.
        3. Markdown formatını kullan. 
        4. Eğer piyasa trendi soruluyorsa mevcut botların yönelimine (LONG/SHORT) göre bir çıkarım yap.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 2000 }
        }
      });

      setResponse(result.text || "Analiz verisi alınamadı.");
    } catch (error) {
      console.error("Gemini Error:", error);
      setResponse("AI motoruyla bağlantı kurulamadı. Lütfen API anahtarınızı ve internet bağlantınızı kontrol edin.");
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-[#0c0c0e] border border-white/10 w-80 sm:w-96 rounded-sm shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 border-b border-white/5 bg-indigo-500/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-indigo-400 fill-indigo-400" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Strateji Zekası v3</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-4 h-[400px] overflow-y-auto space-y-4 bg-black/40 scrollbar-thin scrollbar-thumb-white/5">
            {response ? (
              <div className="text-[12px] text-zinc-300 leading-relaxed font-sans prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br/>') }} />
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="relative">
                  <Loader2 size={32} className="text-indigo-500 animate-spin" />
                  <BrainCircuit size={16} className="absolute inset-0 m-auto text-white" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest animate-pulse">
                    {isThinking ? 'Veriler Analiz Ediliyor...' : 'Yükleniyor...'}
                  </span>
                  <span className="text-[9px] text-zinc-600 font-mono mt-1">Gemini 3.0 Pro Thinking Mode</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                  <MessageSquare size={32} className="text-zinc-700" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">Analiz Hazır</p>
                  <p className="text-[10px] text-zinc-600 mt-1 max-w-[200px] mx-auto italic">"BTC trendi nasıl?", "Botlarımın performansı nasıl?" gibi sorular sorabilirsiniz.</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 flex gap-2 bg-black">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && analyzeMarket()}
              placeholder="Soru sorun..."
              className="flex-1 bg-[#050505] border border-white/10 rounded-sm px-4 py-2 text-xs text-white outline-none focus:border-indigo-500/50 transition-all font-mono"
            />
            <button 
              onClick={analyzeMarket}
              disabled={isLoading || !query.trim()}
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-sm flex items-center justify-center transition-all shadow-lg shadow-indigo-600/10"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <ShieldCheck size={10} className="text-emerald-500" />
              <span className="text-[8px] text-zinc-500 uppercase font-bold">End-to-End Encrypted</span>
            </div>
            <span className="text-[8px] text-zinc-600 font-mono">MODEL: PRO_V3_092025</span>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white/10"
        >
          <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-20 group-hover:hidden"></div>
          <BrainCircuit size={32} className="text-white relative z-10" />
        </button>
      )}
    </div>
  );
};

export default VoiceAssistant;