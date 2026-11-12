/**
 * Velox - Weather Widget (Native Fetch + Open-Meteo API)
 * Replaces legacy Forecast.io with zero-dependency modern web standards.
 */

const DEFAULT_COORDS = {
  lat: 34.0195,
  lon: -118.4912,
  city: "Santa Monica, CA"
};

// Weather code mappings to conditions & icons
const WEATHER_CODES = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Depositing rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  61: { label: "Slight rain", icon: "🌧️" },
  63: { label: "Moderate rain", icon: "🌧️" },
  71: { label: "Slight snow", icon: "🌨️" },
  80: { label: "Rain showers", icon: "🌦️" },
  95: { label: "Thunderstorm", icon: "⛈️" }
};

export async function fetchCurrentWeather() {
  let lat = DEFAULT_COORDS.lat;
  let lon = DEFAULT_COORDS.lon;
  let cityName = DEFAULT_COORDS.city;

  // Try native geolocation API non-blockingly if permitted
  if ("geolocation" in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
      });
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      cityName = "Current Location";
    } catch (_) {
      // Gracefully fall back to Santa Monica
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,precipitation&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather service unreachable");
    
    const data = await response.json();
    const current = data.current;
    const weatherInfo = WEATHER_CODES[current.weather_code] || { label: "Fair", icon: "🌤️" };

    return {
      city: cityName,
      temp: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      condition: weatherInfo.label,
      icon: weatherInfo.icon
    };
  } catch (err) {
    console.warn("Weather fetch fallback:", err);
    return {
      city: cityName,
      temp: 72,
      humidity: 55,
      precipitation: 0,
      condition: "Sunny",
      icon: "☀️"
    };
  }
}
