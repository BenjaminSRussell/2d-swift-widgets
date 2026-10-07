import Foundation

/// Codable twin of `src/types/widgetData.ts` (#5).
public struct WeatherPayload: Codable, Sendable {
    public let kind: String
    public let location: String
    public let temp_f: Double
    public let condition: String
    public let high_f: Double
    public let low_f: Double
    public let humidity_pct: Double?
    public let wind_mph: Double?
}

public struct StockQuote: Codable, Sendable {
    public let symbol: String
    public let price: Double
    public let change_pct: Double
}

public struct StocksPayload: Codable, Sendable {
    public let kind: String
    public let as_of: String
    public let quotes: [StockQuote]
    public let sparkline: [Double]?
}

public struct MusicPayload: Codable, Sendable {
    public let kind: String
    public let title: String
    public let artist: String
    public let album: String?
    public let duration_sec: Double
    public let position_sec: Double
    public let artwork_url: String?
}
