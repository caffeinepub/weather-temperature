# Weather Temperature App

## Current State
New project with no existing features.

## Requested Changes (Diff)

### Add
- Loading screen shown on app startup with animated spinner/progress
- Weather dashboard showing current temperature for a city
- City search input to look up temperature by location
- Display: current temp, feels like, min/max, weather condition, humidity, wind speed
- HTTP outcall to Open-Meteo (free, no API key required) for weather data
- Geolocation-based default or manual city search via geocoding API

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Select http-outcalls component
2. Generate Motoko backend with HTTP outcall to Open-Meteo API (geocoding + weather)
3. Build frontend with:
   - Animated loading screen (fades out after data loads)
   - City search bar
   - Temperature display card with weather details
   - Refresh button
