# Widget feed contract (#5)

Shared JSON payloads for Weather / Stocks / Music. TypeScript: `src/types/widgetData.ts`. Swift Codable twin: `swift/WidgetDataContracts`.

## Endpoints

| Kind | Path | Fixture |
|------|------|---------|
| weather | `GET /api/widget/weather` | `/fixtures/weather.json` |
| stocks | `GET /api/widget/stocks` | `/fixtures/stocks.json` |
| music | `GET /api/widget/music` | `/fixtures/music.json` |

Web widgets call the API first, then fall back to the fixture (Vite `public/`).

## Example — weather

```json
{
  "kind": "weather",
  "location": "San Fran",
  "temp_f": 72,
  "condition": "Partly Cloudy",
  "high_f": 78,
  "low_f": 62
}
```

See also outline Blueprint checklist in README.
