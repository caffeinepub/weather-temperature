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
  uvIndex: number;
  sunrise: string;
  sunset: string;
  hourly: { time: string; temp: number; weatherCode: number }[];
  daily: {
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
  }[];
  aqi: number;
  dewPoint: number;
  pressureHourly: number[];
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

  const [weatherRes, aqiRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,uv_index,dew_point_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&hourly=temperature_2m,weather_code,surface_pressure&timezone=auto&forecast_days=7&forecast_hours=24`,
    ),
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=european_aqi&forecast_days=1`,
    ),
  ]);

  if (!weatherRes.ok) throw new Error("Weather request failed");
  const weatherData = await weatherRes.json();

  let aqi = 0;
  if (aqiRes.ok) {
    try {
      const aqiData = await aqiRes.json();
      aqi = aqiData?.hourly?.european_aqi?.[0] ?? 0;
    } catch {
      aqi = 0;
    }
  }

  const current = weatherData.current;
  const dailyData = weatherData.daily;
  const hourlyData = weatherData.hourly;

  const hourly = (hourlyData.time as string[]).slice(0, 24).map((t, i) => ({
    time: t,
    temp: hourlyData.temperature_2m[i] as number,
    weatherCode: hourlyData.weather_code[i] as number,
  }));

  const daily = (dailyData.time as string[]).map((t, i) => ({
    date: t,
    tempMax: dailyData.temperature_2m_max[i] as number,
    tempMin: dailyData.temperature_2m_min[i] as number,
    weatherCode: dailyData.weather_code[i] as number,
  }));

  const pressureHourly: number[] = (
    (hourlyData.surface_pressure as number[]) || []
  ).slice(0, 24);

  const result: Weather = {
    cityName: name,
    lat: latitude,
    lon: longitude,
    currentTemp: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    tempMax: dailyData.temperature_2m_max[0],
    tempMin: dailyData.temperature_2m_min[0],
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: BigInt(current.weather_code),
    timezone: weatherData.timezone ?? "UTC",
    uvIndex: current.uv_index ?? 0,
    sunrise: dailyData.sunrise?.[0] ?? "",
    sunset: dailyData.sunset?.[0] ?? "",
    hourly,
    daily,
    aqi,
    dewPoint: current.dew_point_2m ?? 0,
    pressureHourly,
  };

  // Cache to localStorage
  try {
    localStorage.setItem(
      "truetemp_cache",
      JSON.stringify({ ...result, weatherCode: Number(result.weatherCode) }),
    );
    localStorage.setItem("truetemp_cache_time", new Date().toISOString());
  } catch {
    // ignore
  }

  return result;
}

export function useGetWeather(cityName: string) {
  return useQuery<Weather>({
    queryKey: ["weather", cityName],
    queryFn: () => fetchWeather(cityName),
    enabled: cityName.trim().length > 0,
    retry: 1,
  });
}
