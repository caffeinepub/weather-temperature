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
  aqiPollutants: { pm25: number; pm10: number; ozone: number };
  dewPoint: number;
  pressureHourly: number[];
  minutelyPrecip: { time: string; precipitation: number }[];
  agricultureData: {
    soilMoisture: number;
    et0: number;
    solarRadiation: number;
  } | null;
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

  const [weatherRes, aqiRes, minutelyRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,uv_index,dew_point_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&hourly=temperature_2m,weather_code,surface_pressure,soil_moisture_0_1cm,et0_fao_evapotranspiration,shortwave_radiation&timezone=auto&forecast_days=7&forecast_hours=24`,
    ),
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=european_aqi,pm2_5,pm10,ozone&forecast_days=1`,
    ),
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&minutely_15=precipitation&forecast_minutely_15=8&timezone=auto`,
    ),
  ]);

  if (!weatherRes.ok) throw new Error("Weather request failed");
  const weatherData = await weatherRes.json();

  let aqi = 0;
  let aqiPollutants = { pm25: 0, pm10: 0, ozone: 0 };
  if (aqiRes.ok) {
    try {
      const aqiData = await aqiRes.json();
      aqi = aqiData?.hourly?.european_aqi?.[0] ?? 0;
      aqiPollutants = {
        pm25: aqiData?.hourly?.pm2_5?.[0] ?? 0,
        pm10: aqiData?.hourly?.pm10?.[0] ?? 0,
        ozone: aqiData?.hourly?.ozone?.[0] ?? 0,
      };
    } catch {
      aqi = 0;
    }
  }

  let minutelyPrecip: { time: string; precipitation: number }[] = [];
  if (minutelyRes.ok) {
    try {
      const mData = await minutelyRes.json();
      const times = mData?.minutely_15?.time as string[] | undefined;
      const precips = mData?.minutely_15?.precipitation as number[] | undefined;
      if (times && precips) {
        minutelyPrecip = times.map((time, i) => ({
          time,
          precipitation: precips[i] ?? 0,
        }));
      }
    } catch {
      minutelyPrecip = [];
    }
  }

  const current = weatherData.current;
  const dailyData = weatherData.daily;
  const hourlyData = weatherData.hourly;

  const hourly = (hourlyData.time as string[]).slice(0, 24).map((tm, i) => ({
    time: tm,
    temp: hourlyData.temperature_2m[i] as number,
    weatherCode: hourlyData.weather_code[i] as number,
  }));

  const daily = (dailyData.time as string[]).map((tm, i) => ({
    date: tm,
    tempMax: dailyData.temperature_2m_max[i] as number,
    tempMin: dailyData.temperature_2m_min[i] as number,
    weatherCode: dailyData.weather_code[i] as number,
  }));

  const pressureHourly: number[] = (
    (hourlyData.surface_pressure as number[]) || []
  ).slice(0, 24);

  // Agriculture / environmental data from hourly[0]
  let agricultureData: Weather["agricultureData"] = null;
  try {
    const sm = hourlyData.soil_moisture_0_1cm?.[0];
    const et0 = hourlyData.et0_fao_evapotranspiration?.[0];
    const sr = hourlyData.shortwave_radiation?.[0];
    if (sm != null && et0 != null && sr != null) {
      agricultureData = {
        soilMoisture: Math.round(sm * 100),
        et0: Math.round(et0 * 10) / 10,
        solarRadiation: Math.round(sr),
      };
    }
  } catch {
    agricultureData = null;
  }

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
    aqiPollutants,
    dewPoint: current.dew_point_2m ?? 0,
    pressureHourly,
    minutelyPrecip,
    agricultureData,
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
