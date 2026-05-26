# Changelog

All notable changes to IO Maliyet Pro are documented in this file.

## [2.0.0] — 27.05.2026

### Added
- Complete UI redesign with dark/light theme system
- Multi-project management with sidebar navigation
- Category-based cost item management (Malzeme, İşçilik, Nakliye, Hırdavat, Hizmet, Diğer)
- KDV (VAT) calculation with selectable rates (0%, 1%, 8%, 10%, 18%, 20%)
- Commission calculation with configurable percentage
- Payment tracking with date, amount, and description
- Dashboard with summary statistics and category donut chart
- Analysis view with bar chart and top-5 cost items
- JSON backup export/import
- CSV export per project
- Print/report functionality with company branding
- 3-language support: Turkish, English, Polish
- 4 currency options: ₺ TL, $ USD, € EUR, zł PLN
- Keyboard shortcuts (Ctrl+N, S, F, D, P, T, Esc)
- Project search and filtering
- Column sorting in cost table
- IO Software branding with custom gradient logo
- Zero demo data — clean slate on first launch

### Technical
- Electron 28 + HTML/CSS/JS stack
- localStorage persistence
- electron-builder packaging (NSIS installer + portable)
- DM Sans + DM Mono typography

## [1.0.0] — 27.05.2026

### Added
- Initial release
- Basic cost/expense table
- Project info panel (name, dates, commission)
- Payment summary (agreed, paid, remaining, extra)
- Single language (Turkish)
- JSON save/load
