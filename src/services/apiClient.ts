import axios from "axios";

const BASE_URL = "https://api.weatherapi.com/v1";

export const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY ?? "";

export class MissingApiKeyError extends Error {
  constructor() {
    super(
      "Missing WeatherAPI key. Add VITE_WEATHER_API_KEY to your .env file (see .env.example)."
    );
    this.name = "MissingApiKeyError";
  }
}

export const weatherClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

weatherClient.interceptors.request.use((config) => {
  if (!WEATHER_API_KEY) {
    throw new MissingApiKeyError();
  }
  config.params = { ...config.params, key: WEATHER_API_KEY };
  return config;
});

export class WeatherApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "WeatherApiError";
    this.status = status;
  }
}

weatherClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return Promise.reject(
          new WeatherApiError("No internet connection. Check your network and try again.")
        );
      }
      const status = error.response.status;
      if (status === 400) {
        return Promise.reject(
          new WeatherApiError("We couldn't find that location. Try a different search.", status)
        );
      }
      if (status === 401 || status === 403) {
        return Promise.reject(
          new WeatherApiError("Weather service authentication failed. Check your API key.", status)
        );
      }
      if (status === 429) {
        return Promise.reject(
          new WeatherApiError("Too many requests right now. Please wait a moment and retry.", status)
        );
      }
      return Promise.reject(
        new WeatherApiError("The weather service is having trouble. Please try again.", status)
      );
    }
    return Promise.reject(error);
  }
);
