/** Shared widget feed contract (#5) — mirrors Swift Codable twin. */

export interface WeatherPayload {
  kind: "weather";
  location: string;
  temp_f: number;
  condition: string;
  high_f: number;
  low_f: number;
  humidity_pct?: number;
  wind_mph?: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change_pct: number;
}

export interface StocksPayload {
  kind: "stocks";
  as_of: string;
  quotes: StockQuote[];
  sparkline?: number[];
}

export interface MusicPayload {
  kind: "music";
  title: string;
  artist: string;
  album?: string;
  duration_sec: number;
  position_sec: number;
  artwork_url?: string | null;
}

export type WidgetPayload = WeatherPayload | StocksPayload | MusicPayload;

export type WidgetKind = WidgetPayload["kind"];
