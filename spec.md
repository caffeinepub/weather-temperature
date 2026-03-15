# TRUE TEMP — UI Redesign

## Current State
The app uses a glassmorphism dark/blue theme with OKLCH tokens, backdrop-blur cards, and animated weather backgrounds. All three pages (Dashboard, Studio, Profile) share this style.

## Requested Changes (Diff)

### Add
- Centered page header with large bold "TRUE TEMP" title and "REAL WEATHER, RIGHT NOW" subtitle
- Bell notification icon button + crescent/moon theme toggle icon button in top-right of header
- Clean white card design replacing glassmorphism
- Search bar redesign: full-width text input + blue "Search" button + circular outline location pin button inline
- Main weather card: location name with pin icon, condition pill badge (outline style), very large bold temperature, ↑max/↓min inline, "Feels like" line, metrics grid (Humidity, Wind, MAX, MIN)
- Rain predictor as a subtle white card with emoji
- Bottom nav: light blue active pill background for active tab, palette icon for Studio, person icon for Profile

### Modify
- Background: very light blue-white (not gradient/animated)
- All cards: plain white with soft box shadow, rounded corners
- Typography: dark navy for headings/temperature, blue for accents
- Remove animated weather background canvas overlay from Dashboard view
- index.css color tokens to match light clean design
- BottomNav icons updated to match screenshot (cloud-sun for Dashboard, palette for Studio, person for Profile)

### Remove
- Glassmorphism backdrop-blur effect on cards
- Dark animated gradient background on main dashboard
- Old search layout (emoji buttons)

## Implementation Plan
1. Update `index.css` — new light color palette (white background, dark navy foreground, blue primary)
2. Rewrite `DashboardPage.tsx` — match screenshot layout exactly: header block, search row, rain card, main weather card with all metrics
3. Update `App.tsx` — move theme/notification icons to header, remove WeatherBackground for light mode
4. Update `BottomNav.tsx` — fix icons and active state styling
5. Keep all data hooks and functionality intact, only change visual presentation
