import { useQuery } from "@tanstack/react-query";

export interface Weather {
  cityName: string;
  lat: number;
  lon: number;
  currentTemp: number;
  feelsLike: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  windSpeed: number;
  weatherCode: bigint;
  timezone: string;
}

async function fetchWeather(cityName: string): Promise<Weather> {
  // Step 1: geocode
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`,
  );
  if (!geoRes.ok) throw new Error("Geocoding request failed");
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(
      `City "${cityName}" not found. Please check the spelling and try again.`,
    );
  }

  const { latitude, longitude, name, timezone } = geoData.results[0];

  // Step 2: weather
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`,
  );
  if (!weatherRes.ok) throw new Error("Weather request failed");
  const weatherData = await weatherRes.json();

  const current = weatherData.current;
  const daily = weatherData.daily;

  return {
    cityName: name,
    lat: latitude,
    lon: longitude,
    currentTemp: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    tempMax: daily.temperature_2m_max[0],
    tempMin: daily.temperature_2m_min[0],
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: BigInt(current.weather_code),
    timezone: timezone ?? weatherData.timezone ?? "UTC",
  };
}

export function useGetWeather(cityName: string) {
  return useQuery<Weather>({
    queryKey: ["weather", cityName],
    queryFn: () => fetchWeather(cityName),
    enabled: cityName.trim().length > 0,
    retry: 1,
  });
}
