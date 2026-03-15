import { useCallback, useEffect, useState } from "react";

export interface Location {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  uvIndex: number;
  pressure: number;
  dewPoint: number;
  precipitation: number;
}

export interface HourlyData {
  time: string[];
  temperature: number[];
  precipitationProbability: number[];
  weatherCode: number[];
  windSpeed: number[];
}

export interface DailyData {
  time: string[];
  tempMax: number[];
  tempMin: number[];
  weatherCode: number[];
  sunrise: string[];
  sunset: string[];
  uvIndexMax: number[];
  precipitationSum: number[];
}

export interface AQIData {
  aqi: number;
  pm25: number;
  pm10: number;
  ozone: number;
}

export interface AgricultureData {
  soilMoisture: number[];
  et0: number[];
  solarRadiation: number[];
}

export interface MinutelyData {
  time: string[];
  precipitation: number[];
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyData;
  daily: DailyData;
  aqi: AQIData | null;
  agriculture: AgricultureData | null;
  minutely: MinutelyData | null;
  historical: { tempSameDay: number | null } | null;
  location: Location;
  fetchedAt: string;
}

const CACHE_KEY = "truetemp_weather_cache";

function getCachedWeather(): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

function cacheWeather(data: WeatherData) {
  try {
    // Store only essential data to avoid quota issues
    const compact = {
      ...data,
      hourly: {
        ...data.hourly,
        time: data.hourly.time.slice(0, 24),
        temperature: data.hourly.temperature.slice(0, 24),
        precipitationProbability: data.hourly.precipitationProbability.slice(
          0,
          24,
        ),
        weatherCode: data.hourly.weatherCode.slice(0, 24),
        windSpeed: data.hourly.windSpeed.slice(0, 24),
      },
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(compact));
  } catch {
    // ignore
  }
}

export function getWeatherCondition(code: number): {
  label: string;
  emoji: string;
  type: string;
} {
  if (code === 0) return { label: "clear", emoji: "☀️", type: "clear" };
  if (code <= 2)
    return { label: "partlyCloudy", emoji: "⛅", type: "partly_cloudy" };
  if (code === 3) return { label: "overcast", emoji: "☁️", type: "cloudy" };
  if (code <= 48) return { label: "fog", emoji: "🌫️", type: "fog" };
  if (code <= 55) return { label: "drizzle", emoji: "🌦️", type: "rain" };
  if (code <= 65) return { label: "rain", emoji: "🌧️", type: "rain" };
  if (code <= 75) return { label: "snow", emoji: "❄️", type: "snow" };
  if (code <= 82) return { label: "rain", emoji: "🌧️", type: "rain" };
  if (code <= 86) return { label: "snow", emoji: "❄️", type: "snow" };
  if (code >= 95) return { label: "thunderstorm", emoji: "⛈️", type: "storm" };
  return { label: "cloudy", emoji: "☁️", type: "cloudy" };
}

export function getMoonPhase(date: Date): {
  phase: string;
  emoji: string;
  illumination: number;
} {
  const known = new Date(2000, 0, 6, 18, 14, 0); // known new moon
  const diff = date.getTime() - known.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  const cycle = 29.53058867;
  const phase = ((days % cycle) + cycle) % cycle;
  const illumination = Math.round(
    ((1 - Math.cos((phase / cycle) * 2 * Math.PI)) / 2) * 100,
  );

  if (phase < 1.85) return { phase: "New Moon", emoji: "🌑", illumination };
  if (phase < 7.38)
    return { phase: "Waxing Crescent", emoji: "🌒", illumination };
  if (phase < 9.22)
    return { phase: "First Quarter", emoji: "🌓", illumination };
  if (phase < 14.77)
    return { phase: "Waxing Gibbous", emoji: "🌔", illumination };
  if (phase < 16.61) return { phase: "Full Moon", emoji: "🌕", illumination };
  if (phase < 22.15)
    return { phase: "Waning Gibbous", emoji: "🌖", illumination };
  if (phase < 23.99)
    return { phase: "Last Quarter", emoji: "🌗", illumination };
  if (phase < 29.53)
    return { phase: "Waning Crescent", emoji: "🌘", illumination };
  return { phase: "New Moon", emoji: "🌑", illumination };
}

async function geocodeCity(name: string): Promise<Location | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`,
    );
    const data = await res.json();
    if (data.results?.[0]) {
      const r = data.results[0];
      return {
        name: r.name,
        lat: r.latitude,
        lon: r.longitude,
        country: r.country,
        admin1: r.admin1,
      };
    }
  } catch {
    // fallback to OSM
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`,
      );
      const data = await res.json();
      if (data[0]) {
        return {
          name: data[0].display_name.split(",")[0],
          lat: Number.parseFloat(data[0].lat),
          lon: Number.parseFloat(data[0].lon),
        };
      }
    } catch {
      // ignore
    }
  }
  return null;
}

async function reverseGeocode(lat: number, lon: number): Promise<Location> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    );
    const data = await res.json();
    const addr = data.address;
    return {
      name: addr.city || addr.town || addr.village || addr.county || "Unknown",
      lat,
      lon,
      country: addr.country,
      admin1: addr.state,
    };
  } catch {
    return { name: "Current Location", lat, lon };
  }
}

async function fetchWeatherData(
  lat: number,
  lon: number,
): Promise<Omit<WeatherData, "location" | "fetchedAt">> {
  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", lat.toString());
  weatherUrl.searchParams.set("longitude", lon.toString());
  weatherUrl.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index,surface_pressure,dew_point_2m",
  );
  weatherUrl.searchParams.set(
    "hourly",
    "temperature_2m,precipitation_probability,weather_code,wind_speed_10m,soil_moisture_0_to_1cm,et0_fao_evapotranspiration,shortwave_radiation",
  );
  weatherUrl.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,uv_index_max,precipitation_sum",
  );
  weatherUrl.searchParams.set("minutely_15", "precipitation");
  weatherUrl.searchParams.set("timezone", "auto");
  weatherUrl.searchParams.set("forecast_days", "7");

  const aqiUrl = new URL(
    "https://air-quality-api.open-meteo.com/v1/air-quality",
  );
  aqiUrl.searchParams.set("latitude", lat.toString());
  aqiUrl.searchParams.set("longitude", lon.toString());
  aqiUrl.searchParams.set("current", "pm2_5,pm10,ozone,european_aqi");

  // Historical (same date last year)
  const lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);
  const dateStr = lastYear.toISOString().split("T")[0];
  const histUrl = new URL("https://archive-api.open-meteo.com/v1/archive");
  histUrl.searchParams.set("latitude", lat.toString());
  histUrl.searchParams.set("longitude", lon.toString());
  histUrl.searchParams.set("start_date", dateStr);
  histUrl.searchParams.set("end_date", dateStr);
  histUrl.searchParams.set("daily", "temperature_2m_mean");
  histUrl.searchParams.set("timezone", "auto");

  const [weatherRes, aqiRes, histRes] = await Promise.allSettled([
    fetch(weatherUrl.toString()).then((r) => r.json()),
    fetch(aqiUrl.toString()).then((r) => r.json()),
    fetch(histUrl.toString()).then((r) => r.json()),
  ]);

  const weather = weatherRes.status === "fulfilled" ? weatherRes.value : null;
  const aqiData = aqiRes.status === "fulfilled" ? aqiRes.value : null;
  const histData = histRes.status === "fulfilled" ? histRes.value : null;

  if (!weather?.current) throw new Error("No weather data");

  const current: CurrentWeather = {
    temperature: weather.current.temperature_2m,
    feelsLike: weather.current.apparent_temperature,
    humidity: weather.current.relative_humidity_2m,
    windSpeed: weather.current.wind_speed_10m,
    weatherCode: weather.current.weather_code,
    uvIndex: weather.current.uv_index,
    pressure: weather.current.surface_pressure,
    dewPoint: weather.current.dew_point_2m,
    precipitation: weather.current.precipitation,
  };

  const hourly: HourlyData = {
    time: weather.hourly?.time ?? [],
    temperature: weather.hourly?.temperature_2m ?? [],
    precipitationProbability: weather.hourly?.precipitation_probability ?? [],
    weatherCode: weather.hourly?.weather_code ?? [],
    windSpeed: weather.hourly?.wind_speed_10m ?? [],
  };

  const daily: DailyData = {
    time: weather.daily?.time ?? [],
    tempMax: weather.daily?.temperature_2m_max ?? [],
    tempMin: weather.daily?.temperature_2m_min ?? [],
    weatherCode: weather.daily?.weather_code ?? [],
    sunrise: weather.daily?.sunrise ?? [],
    sunset: weather.daily?.sunset ?? [],
    uvIndexMax: weather.daily?.uv_index_max ?? [],
    precipitationSum: weather.daily?.precipitation_sum ?? [],
  };

  const aqi: AQIData | null = aqiData?.current
    ? {
        aqi: aqiData.current.european_aqi ?? 0,
        pm25: aqiData.current.pm2_5 ?? 0,
        pm10: aqiData.current.pm10 ?? 0,
        ozone: aqiData.current.ozone ?? 0,
      }
    : null;

  const agriculture: AgricultureData = {
    soilMoisture: weather.hourly?.soil_moisture_0_to_1cm ?? [],
    et0: weather.hourly?.et0_fao_evapotranspiration ?? [],
    solarRadiation: weather.hourly?.shortwave_radiation ?? [],
  };

  const minutelyRaw = weather.minutely_15;
  const minutely: MinutelyData | null = minutelyRaw
    ? {
        time: minutelyRaw.time ?? [],
        precipitation: minutelyRaw.precipitation ?? [],
      }
    : null;

  const historical =
    histData?.daily?.temperature_2m_mean?.[0] !== undefined
      ? { tempSameDay: histData.daily.temperature_2m_mean[0] }
      : null;

  return { current, hourly, daily, aqi, agriculture, minutely, historical };
}

export function useWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location>({
    name: "Mumbai",
    lat: 19.076,
    lon: 72.8777,
    country: "India",
    admin1: "Maharashtra",
  });

  const loadWeather = useCallback(async (location: Location) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(location.lat, location.lon);
      const full: WeatherData = {
        ...data,
        location,
        fetchedAt: new Date().toISOString(),
      };
      setWeatherData(full);
      cacheWeather(full);
      setIsOffline(false);
    } catch {
      const cached = getCachedWeather();
      if (cached) {
        setWeatherData(cached);
        setIsOffline(true);
      } else {
        setError("Unable to fetch weather data");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run only on mount - intentional
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only
  useEffect(() => {
    loadWeather(currentLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchCity = useCallback(
    async (name: string) => {
      setIsLoading(true);
      const loc = await geocodeCity(name);
      if (loc) {
        setCurrentLocation(loc);
        await loadWeather(loc);
      } else {
        setError("City not found");
        setIsLoading(false);
      }
    },
    [loadWeather],
  );

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = await reverseGeocode(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        setCurrentLocation(loc);
        await loadWeather(loc);
      },
      () => setError("Unable to retrieve your location"),
    );
  }, [loadWeather]);

  const switchToCity = useCallback(
    (loc: Location) => {
      setCurrentLocation(loc);
      loadWeather(loc);
    },
    [loadWeather],
  );

  return {
    weatherData,
    isLoading,
    isOffline,
    error,
    currentLocation,
    searchCity,
    useMyLocation,
    switchToCity,
    reload: () => loadWeather(currentLocation),
  };
}

export function parseRainPredictor(minutely: MinutelyData | null): string {
  if (!minutely || minutely.time.length === 0) return "noRain";

  const now = new Date();
  const currentMinute = now.getMinutes();
  const roundedMinute = Math.floor(currentMinute / 15) * 15;
  const currentTime = new Date(now);
  currentTime.setMinutes(roundedMinute, 0, 0);

  let rainStart = -1;
  let rainEnd = -1;

  for (let i = 0; i < Math.min(8, minutely.time.length); i++) {
    const precip = minutely.precipitation[i];
    if (precip > 0.1) {
      if (rainStart === -1) rainStart = i;
      rainEnd = i;
    }
  }

  if (rainStart === -1) return "noRain";

  const startInMinutes = rainStart * 15;
  const durationMinutes = (rainEnd - rainStart + 1) * 15;

  if (startInMinutes === 0) {
    return `rainNow:${durationMinutes}`;
  }
  return `rainIn:${startInMinutes}:${durationMinutes}`;
}
