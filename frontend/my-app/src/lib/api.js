const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.detail || "Unable to reach the FarmSense API.");
  }

  return payload;
}

export function getOptions() {
  return request("/api/forecast/options");
}

export function getMarkets(commodity) {
  const params = new URLSearchParams({ commodity });
  return request(`/api/forecast/markets?${params.toString()}`);
}

export function getForecastSummary({ commodity, market, state, horizonDays }) {
  const params = new URLSearchParams({
    commodity,
    market,
    state,
    horizon_days: String(horizonDays),
  });

  return request(`/api/forecast/summary?${params.toString()}`);
}

export function getMarketComparison({ commodity, limit = 6 }) {
  const params = new URLSearchParams({
    commodity,
    limit: String(limit),
  });

  return request(`/api/forecast/comparison?${params.toString()}`);
}
