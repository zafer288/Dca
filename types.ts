export interface OrderInfo {
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  order_id: number;
  time: string;
}

export interface ExchangeAccount {
  id: string;
  name: string;
  exchange: 'BINANCE' | 'BYBIT' | 'OKX' | 'KUCOIN';
  apiKey: string;
  apiSecret: string;
}

export interface BotConfig {
  bot_id: string;
  accountId: string;
  accountName?: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  order_type: 'MARKET' | 'LIMIT';
  leverage: number;
  order_amount: number;
  stop_loss: number;
  take_profit: number;
  // State tracking
  has_open_position: boolean;
  entry_price: number;
  current_price: number;
  total_realized_pnl: number;
  
  is_active: boolean;
  last_signal_time: string | null;
  signal_count: number;
  total_orders: number;
  last_order_info: OrderInfo | null;
  created_at: string;
}

export interface GlobalStats {
  pnl_24h: number;
  pnl_all_time: number;
  active_bots: number;
  total_volume: number;
  uptime?: string;
  server_status?: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}

export interface SystemConfig {
  accounts: ExchangeAccount[];
  webhookPassphrase: string;
  webhookUrl: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
}