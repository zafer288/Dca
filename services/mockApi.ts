
import { BotConfig, GlobalStats, LogEntry, SystemConfig, ExchangeAccount } from '../types';

// Binance Futures Standartlarına Uygun Sembol Listesi ve Spesifikasyonlar
const BINANCE_FUTURES_SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "AVAXUSDT", 
  "DOTUSDT", "LINKUSDT", "MATICUSDT", "LTCUSDT", "BCHUSDT", "TRXUSDT", "ETCUSDT"
].sort();

// Binance'in hassasiyet kurallarını simüle etmek için yardımcı
const formatQuantity = (qty: number, stepSize: number = 0.001) => {
  const precision = Math.log10(1/stepSize);
  return parseFloat(qty.toFixed(precision));
};

const INITIAL_ACCOUNTS: ExchangeAccount[] = [
  { id: 'acc_1', name: 'Binance Ana (Futures)', exchange: 'BINANCE', apiKey: '***', apiSecret: '***' }
];

const INITIAL_BOTS: BotConfig[] = [
  {
    bot_id: 'BTC_PRO_SCALPER',
    accountId: 'acc_1',
    accountName: 'Binance Ana (Futures)',
    symbol: 'BTCUSDT',
    side: 'BUY',
    order_type: 'MARKET',
    leverage: 20,
    order_amount: 50,
    stop_loss: 1.5,
    take_profit: 3.0,
    has_open_position: false,
    entry_price: 0,
    current_price: 67450.20, 
    total_realized_pnl: 24.50,
    is_active: true,
    last_signal_time: null,
    signal_count: 12,
    total_orders: 8,
    last_order_info: null,
    created_at: new Date().toISOString()
  }
];

let bots: BotConfig[] = [...INITIAL_BOTS];
let globalStats: GlobalStats = {
  pnl_24h: 12.40,
  pnl_all_time: 245.80,
  active_bots: 1,
  total_volume: 85400
};

let logs: LogEntry[] = [
  { id: '1', timestamp: new Date().toISOString(), level: 'INFO', message: 'Binance Futures API v2 Protokolü Aktif.' },
  { id: '2', timestamp: new Date().toISOString(), level: 'SUCCESS', message: 'API Bağlantısı Doğrulandı: recvWindow=5000ms' }
];

let systemConfig: SystemConfig = {
  accounts: [...INITIAL_ACCOUNTS],
  webhookPassphrase: 'binance_secure',
  webhookUrl: 'http://localhost:8080/webhook'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const addLog = (level: LogEntry['level'], message: string) => {
  const newLog: LogEntry = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    level,
    message
  };
  logs = [newLog, ...logs].slice(0, 100); 
};

export const api = {
  getBots: async (): Promise<BotConfig[]> => {
    await delay(150);
    return bots.map(bot => {
      if (bot.has_open_position) {
        // Binance canlı fiyat oynaklığı simülasyonu
        const drift = (Math.random() - 0.48) * 50; 
        bot.current_price += drift;
      }
      return bot;
    });
  },

  getStats: async (): Promise<GlobalStats> => {
    await delay(100);
    return { ...globalStats, active_bots: bots.filter(b => b.is_active).length };
  },

  getLogs: async (): Promise<LogEntry[]> => [...logs],

  getSymbols: async (): Promise<string[]> => [...BINANCE_FUTURES_SYMBOLS],

  getConfig: async (): Promise<SystemConfig> => ({ ...systemConfig }),

  updateConfig: async (newConfig: Partial<SystemConfig>): Promise<SystemConfig> => {
    systemConfig = { ...systemConfig, ...newConfig };
    addLog('INFO', 'Binance API Parametreleri güncellendi.');
    return systemConfig;
  },

  createBot: async (config: Partial<BotConfig>): Promise<BotConfig> => {
    await delay(300);
    const newBot: BotConfig = {
      bot_id: config.bot_id || `BIN_${Date.now()}`,
      accountId: config.accountId || 'acc_1',
      accountName: 'Binance Ana',
      symbol: config.symbol || 'BTCUSDT',
      side: config.side || 'BUY',
      order_type: 'MARKET',
      leverage: config.leverage || 1,
      order_amount: config.order_amount || 10,
      stop_loss: config.stop_loss || 0,
      take_profit: config.take_profit || 0,
      has_open_position: false,
      entry_price: 0,
      current_price: 0,
      total_realized_pnl: 0,
      is_active: true,
      last_signal_time: null,
      signal_count: 0,
      total_orders: 0,
      last_order_info: null,
      created_at: new Date().toISOString(),
    };
    bots.push(newBot);
    addLog('SUCCESS', `Binance Botu Başlatıldı: ${newBot.symbol}`);
    return newBot;
  },

  toggleBot: async (id: string, active: boolean) => {
    const bot = bots.find(b => b.bot_id === id);
    if (bot) bot.is_active = active;
  },

  deleteBot: async (id: string) => {
    bots = bots.filter(b => b.bot_id !== id);
    addLog('WARNING', `Birim Silindi: ${id}`);
  },

  simulateWebhook: async (bot_id: string, passphrase: string, action: 'entry' | 'exit') => {
    await delay(300);
    const bot = bots.find(b => b.bot_id === bot_id);
    if (!bot) throw new Error('Bot bulunamadı');

    if (action === 'entry') {
      if (bot.has_open_position) return;
      bot.has_open_position = true;
      bot.entry_price = bot.current_price || 65000;
      const qty = (bot.order_amount * bot.leverage) / bot.entry_price;
      bot.last_order_info = {
        symbol: bot.symbol,
        side: bot.side,
        quantity: formatQuantity(qty, 0.001),
        price: bot.entry_price,
        order_id: Math.floor(Math.random() * 1000000),
        time: new Date().toISOString()
      };
      addLog('SUCCESS', `MARKET ALIM: ${bot.symbol} @ ${bot.entry_price.toFixed(2)} [Binance Order Filled]`);
    } else {
      if (!bot.has_open_position) return;
      const profit = (bot.current_price - bot.entry_price) * (bot.last_order_info?.quantity || 0);
      bot.total_realized_pnl += bot.side === 'BUY' ? profit : -profit;
      bot.has_open_position = false;
      addLog('SUCCESS', `MARKET KAPAT: ${bot.symbol} PnL: $${profit.toFixed(2)} [Position Liquidated]`);
    }
    return { status: 'success' };
  }
};
