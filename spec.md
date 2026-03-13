# TRUE TEMP

## Current State
A full-featured weather app for India with:
- Current weather, feels like, humidity, wind speed, UV index
- Hourly and 7-day forecasts
- AQI card, UV card, location card (map + text)
- Clothing suggestions, allergy/commute forecasts
- Morning/afternoon briefing notifications
- Sun/moon tracking with arc and moon phase
- Historical trivia (last year comparison)
- Dynamic animated backgrounds reacting to weather + theme
- Light/dark theme toggle (smooth crossfade)
- Google AdSense banners (top + bottom)
- PWA-installable
- All data fetched frontend-only via open-meteo + OpenStreetMap

## Requested Changes (Diff)

### Add
- **Daily Visit Streak**: Track consecutive daily app opens via localStorage. Show streak count with fire badge (🔥) and milestone animations (3, 7, 14, 30 days). Display streak card in the UI.
- **Haptic Feedback**: Use `navigator.vibrate()` when scrolling hourly temperature slider and when a severe weather alert fires. Unique vibration pattern for alerts (e.g. 200ms-100ms-200ms-100ms-400ms).
- **Share Weather Graphic**: "Share" button that uses HTML Canvas to render a branded weather card (current temp, condition, high/low, location, TRUE TEMP watermark) as a PNG. Use Web Share API if available, else download the image.
- **Camera Weather Overlay**: Button to open device camera (using getUserMedia). Capture a photo and overlay current temperature + weather icon on top. Allow saving/sharing the result.
- **Hidden Easter Egg**: When temperature is exactly 0°C or drops below 0°C, show a tiny pixel-art snowman animation. When it's extremely hot (>40°C), show a melting pixel-art sun.
- **Dew Point Card**: Show dew point alongside humidity. open-meteo provides dew point at 2m. Include comfort label ("Comfortable", "Humid", "Very Muggy").
- **Barometric Pressure + Trend**: Show surface pressure (hPa) with a trend arrow (rising ↑, falling ↓, steady →) based on comparison of last 3 hours of pressure data. Include storm warning if pressure drops rapidly.
- **Smart Offline Mode**: Service worker caches last successful weather fetch in localStorage with timestamp. When offline, show cached data with a "Last updated at [time]" yellow banner. Show offline indicator in header.

### Modify
- Severe weather alert trigger should also call `navigator.vibrate([200,100,200,100,400])` in addition to existing in-app/push behavior.
- Hourly forecast scroll should call `navigator.vibrate(10)` on each scroll step (short tick).

### Remove
- Nothing removed.

## Implementation Plan
1. Add `useStreak` hook: reads/writes localStorage keys `truetemp_streak_count`, `truetemp_streak_last_date`. Increment if last visit was yesterday; reset if >1 day gap; show milestone modals at 3/7/14/30.
2. Add `StreakCard` component showing streak count, fire badge, milestone message.
3. Add haptic utility `haptic(pattern)` wrapping `navigator.vibrate` with feature detection.
4. Wire haptic to hourly scroll handler and severe alert trigger.
5. Add `ShareCard` component: renders a Canvas-based weather graphic, triggers Web Share API or PNG download.
6. Add `CameraOverlay` component: opens camera via `getUserMedia`, overlays weather text on canvas snapshot, shows save/share button.
7. Add easter egg logic: monitor current temp, conditionally render pixel-art animations (CSS/canvas sprites).
8. Fetch `dew_point_2m` from open-meteo current weather; add `DewPointCard`.
9. Fetch `surface_pressure` with hourly data (last 3 hours); compute trend; add `PressureCard`.
10. Implement offline detection (`window.addEventListener('online'/'offline')`); cache last fetch to localStorage; show offline banner when `navigator.onLine === false`.
