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

async function geocodeWithOpenMeteo(
  cityName: string,
): Promise<{ latitude: number; longitude: number; name: string } | null> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`,
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;
  const { latitude, longitude, name } = data.results[0];
  return { latitude, longitude, name };
}

async function geocodeWithNominatim(
  cityName: string,
): Promise<{ latitude: number; longitude: number; name: string } | null> {
  const query = `${cityName}, India`;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`,
    { headers: { "Accept-Language": "en" } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.length === 0) return null;
  const item = data[0];
  const addr = item.address || {};
  const name =
    addr.village ||
    addr.hamlet ||
    addr.suburb ||
    addr.town ||
    addr.city ||
    item.display_name.split(",")[0];
  return {
    latitude: Number.parseFloat(item.lat),
    longitude: Number.parseFloat(item.lon),
    name,
  };
}

async function fetchWeather(cityName: string): Promise<Weather> {
  let geo = await geocodeWithOpenMeteo(cityName);

  if (!geo) {
    geo = await geocodeWithNominatim(cityName);
  }

  if (!geo) {
    throw new Error(
      `Location "${cityName}" not found. Please check the spelling and try again.`,
    );
  }

  const { latitude, longitude, name } = geo;

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
    timezone: weatherData.timezone ?? "UTC",
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
