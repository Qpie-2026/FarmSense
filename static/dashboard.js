const bootstrap = window.__PUREZONE_BOOTSTRAP__ || {};
const locationSelect = document.getElementById("location-select");
const weatherSummary = document.getElementById("weather-summary");
const marketSummary = document.getElementById("market-summary");
const cardsGrid = document.getElementById("cards-grid");
const forecastNote = document.getElementById("forecast-note");
const statusBanner = document.getElementById("status-banner");
const cardsTitle = document.getElementById("cards-title");
const toggleButtons = Array.from(document.querySelectorAll(".toggle-btn"));

const state = {
  selectedHorizon: 7,
  payload: null,
};

const commodityIcons = {
  Onion: `
    <svg viewBox="0 0 120 120" class="commodity-svg" aria-hidden="true">
      <defs>
        <linearGradient id="onionBulb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d08ec0"></stop>
          <stop offset="100%" stop-color="#9a547f"></stop>
        </linearGradient>
      </defs>
      <path d="M60 22c8 11 15 18 15 28 0 5-2 9-5 13 10 5 17 15 17 28 0 19-13 29-27 29s-27-10-27-29c0-13 7-23 17-28-3-4-5-8-5-13 0-10 7-17 15-28z" fill="url(#onionBulb)"></path>
      <path d="M60 22c-1-8 3-16 10-20-1 9 1 16 8 21-8 0-13-2-18-1z" fill="#5e8e39"></path>
      <path d="M49 71c6 4 17 4 23 0" stroke="#f6d7ef" stroke-width="4" stroke-linecap="round" fill="none"></path>
    </svg>
  `,
  Potato: `
    <svg viewBox="0 0 120 120" class="commodity-svg" aria-hidden="true">
      <defs>
        <linearGradient id="potatoSkin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d0a26c"></stop>
          <stop offset="100%" stop-color="#9b6531"></stop>
        </linearGradient>
      </defs>
      <path d="M30 69c0-20 14-36 34-36 10 0 16 3 22 9 7 7 14 13 14 26 0 22-19 34-39 34-15 0-31-8-31-33z" fill="url(#potatoSkin)"></path>
      <circle cx="48" cy="60" r="3" fill="#815120"></circle>
      <circle cx="69" cy="76" r="3" fill="#815120"></circle>
      <circle cx="77" cy="57" r="2.8" fill="#815120"></circle>
    </svg>
  `,
  Tomato: `
    <svg viewBox="0 0 120 120" class="commodity-svg" aria-hidden="true">
      <defs>
        <linearGradient id="tomatoGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff765f"></stop>
          <stop offset="100%" stop-color="#cf352b"></stop>
        </linearGradient>
      </defs>
      <circle cx="60" cy="66" r="31" fill="url(#tomatoGlow)"></circle>
      <path d="M60 29c7 4 14 5 21 1-3 8-3 13 1 18-8-3-14-2-18 4-1-6-5-8-12-8 4-5 5-9 3-15-4 3-8 4-15 3 5-7 12-10 20-3z" fill="#4d8b32"></path>
      <circle cx="47" cy="58" r="6" fill="rgba(255,255,255,0.18)"></circle>
    </svg>
  `,
  Wheat: `
    <svg viewBox="0 0 120 120" class="commodity-svg" aria-hidden="true">
      <path d="M60 20v74" stroke="#7b4e1f" stroke-width="5" stroke-linecap="round"></path>
      <path d="M60 33c-9 1-15-4-18-11 9-1 15 3 18 11zm0 13c-10 0-18-5-21-12 10-1 18 4 21 12zm0 14c-10 0-18-4-22-11 10-1 19 3 22 11zm0 15c-10 0-18-4-21-11 10-1 18 3 21 11z" fill="#e0b54b"></path>
      <path d="M60 33c9 1 15-4 18-11-9-1-15 3-18 11zm0 13c10 0 18-5 21-12-10-1-18 4-21 12zm0 14c10 0 18-4 22-11-10-1-19 3-22 11zm0 15c10 0 18-4 21-11-10-1-18 3-21 11z" fill="#f0cc66"></path>
    </svg>
  `,
  default: `
    <svg viewBox="0 0 120 120" class="commodity-svg" aria-hidden="true">
      <ellipse cx="60" cy="72" rx="31" ry="24" fill="#c98147"></ellipse>
      <path d="M31 70c9 6 18 8 29 8 12 0 22-2 30-8" stroke="#f8dec1" stroke-width="5" fill="none" stroke-linecap="round"></path>
      <path d="M42 51c7-8 13-12 18-12s11 4 18 12" stroke="#5e8e39" stroke-width="6" fill="none" stroke-linecap="round"></path>
    </svg>
  `,
};

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedMoney(value) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatMoney(value)}`;
}

function formatSignedPercent(value) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

function setStatus(message, isError = false) {
  if (!message) {
    statusBanner.classList.add("hidden");
    statusBanner.textContent = "";
    statusBanner.style.background = "";
    statusBanner.style.color = "";
    statusBanner.style.borderColor = "";
    return;
  }

  statusBanner.classList.remove("hidden");
  statusBanner.textContent = message;

  if (isError) {
    statusBanner.style.background = "rgba(178, 58, 45, 0.14)";
    statusBanner.style.color = "#7c1f17";
    statusBanner.style.borderColor = "rgba(178, 58, 45, 0.18)";
  } else {
    statusBanner.style.background = "rgba(24, 128, 75, 0.12)";
    statusBanner.style.color = "#1e633d";
    statusBanner.style.borderColor = "rgba(24, 128, 75, 0.2)";
  }
}

function getCommodityIcon(commodity) {
  return commodityIcons[commodity] || commodityIcons.default;
}

function updateToggleUi() {
  toggleButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.horizon) === state.selectedHorizon);
  });
}

function renderWeather(weather, location) {
  weatherSummary.innerHTML = `
    <div>
      <h2 class="section-title">${location.label}, ${location.region}</h2>
      <p class="insight-copy">Live weather synced with the selected mandi view.</p>
    </div>
    <div class="weather-grid">
      <div class="metric-tile">
        <span class="metric-label">Condition</span>
        <span class="metric-value">${weather.description}</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Temperature</span>
        <span class="metric-value">${weather.temperature}&deg;C</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Humidity</span>
        <span class="metric-value">${weather.humidity}%</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Rain (1h)</span>
        <span class="metric-value">${weather.rain_1h} mm</span>
      </div>
    </div>
  `;
}

function renderSummary(summaryByHorizon) {
  const summary = summaryByHorizon?.[String(state.selectedHorizon)] || {
    tracked_items: 0,
    increase_count: 0,
    decrease_count: 0,
    stable_count: 0,
  };

  marketSummary.innerHTML = `
    <div class="summary-grid">
      <div class="metric-tile">
        <span class="metric-label">Items Tracked</span>
        <span class="metric-value">${summary.tracked_items}</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Increasing</span>
        <span class="metric-value" style="color: var(--positive);">${summary.increase_count}</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Decreasing</span>
        <span class="metric-value" style="color: var(--negative);">${summary.decrease_count}</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Stable</span>
        <span class="metric-value">${summary.stable_count}</span>
      </div>
    </div>
  `;
}

function createLinePath(points, width, height, xMin, xMax, yMin, yMax) {
  if (!points.length) {
    return "";
  }

  const scaleX = (value) => ((value - xMin) / (xMax - xMin || 1)) * width;
  const scaleY = (value) => height - ((value - yMin) / (yMax - yMin || 1)) * height;

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${scaleX(point.offset).toFixed(2)} ${scaleY(point.price).toFixed(2)}`)
    .join(" ");
}

function renderChart(card, horizonValue) {
  const width = 320;
  const height = 120;
  const allPoints = card.chart_series || [];
  const visibleForecastPoints = allPoints.filter((point) => point.kind === "forecast" && point.offset <= horizonValue);
  const historyPoints = allPoints.filter((point) => point.kind === "history");
  const chartPoints = [...historyPoints, ...visibleForecastPoints];
  const yValues = chartPoints.map((point) => point.price);
  const yMin = Math.min(...yValues) * 0.94;
  const yMax = Math.max(...yValues) * 1.06;
  const xMin = historyPoints[0]?.offset ?? 0;
  const xMax = horizonValue;
  const historyPath = createLinePath(historyPoints, width, height, xMin, xMax, yMin, yMax);
  const forecastPath = createLinePath(
    [...historyPoints.slice(-1), ...visibleForecastPoints],
    width,
    height,
    xMin,
    xMax,
    yMin,
    yMax
  );
  const selectedPoint = visibleForecastPoints.find((point) => point.offset === horizonValue) || visibleForecastPoints.at(-1);

  const scaleX = (value) => ((value - xMin) / (xMax - xMin || 1)) * width;
  const scaleY = (value) => height - ((value - yMin) / (yMax - yMin || 1)) * height;
  const markerX = selectedPoint ? scaleX(selectedPoint.offset) : width;
  const markerY = selectedPoint ? scaleY(selectedPoint.price) : height / 2;

  return `
    <div class="chart-shell">
      <div class="chart-caption">
        <span>Price curve</span>
        <span>${horizonValue}-day focus</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="price-chart" role="img" aria-label="${card.commodity} price trend chart">
        <path d="${historyPath}" class="chart-line chart-line-history"></path>
        <path d="${forecastPath}" class="chart-line chart-line-forecast"></path>
        <line x1="${markerX}" y1="0" x2="${markerX}" y2="${height}" class="chart-marker-line"></line>
        <circle cx="${markerX}" cy="${markerY}" r="5.5" class="chart-marker-dot"></circle>
      </svg>
      <div class="chart-labels">
        <span>Recent history</span>
        <span>Forecast horizon</span>
      </div>
    </div>
  `;
}

function renderCards(cards) {
  const horizonKey = String(state.selectedHorizon);

  cardsGrid.innerHTML = cards
    .map((card) => {
      const horizonForecast = card.forecast_prices[horizonKey];
      const changeClass = horizonForecast.direction === "increasing"
        ? "positive"
        : horizonForecast.direction === "decreasing"
          ? "negative"
          : "";

      const changeCopy =
        horizonForecast.direction === "increasing"
          ? "Prices may rise"
          : horizonForecast.direction === "decreasing"
            ? "Prices may soften"
            : "Prices may stay steady";

      return `
        <article class="glass-panel commodity-card ${horizonForecast.direction}">
          <div class="card-head">
            <div>
              <p class="section-tag">Commodity</p>
              <h3 class="commodity-name">${card.commodity}</h3>
            </div>
            <div class="commodity-illustration">${getCommodityIcon(card.commodity)}</div>
          </div>

          <div class="trend-pill ${horizonForecast.direction}">
            <span>${changeCopy}</span>
          </div>

          <div class="price-band">
            <div class="price-block">
              <span class="price-label">Current Price</span>
              <span class="price-value">${formatMoney(card.current_price)}</span>
            </div>
            <div class="price-block">
              <span class="price-label">${state.selectedHorizon}-Day Forecast</span>
              <span class="price-value ${changeClass}">${formatMoney(horizonForecast.predicted_price)}</span>
            </div>
          </div>

          ${renderChart(card, state.selectedHorizon)}

          <div class="card-meta">
            <span>Expected move: <strong class="${changeClass}">${formatSignedMoney(horizonForecast.change_amount)}</strong></span>
            <span>Change percentage: <strong class="${changeClass}">${formatSignedPercent(horizonForecast.change_pct)}</strong></span>
            <span>Historical reference date: ${card.latest_historical_date}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderBoard() {
  if (!state.payload) {
    return;
  }

  renderWeather(state.payload.weather, state.payload.location);
  renderSummary(state.payload.market_summary_by_horizon);
  renderCards(state.payload.cards);

  cardsTitle.textContent = `Today’s mandi board with ${state.selectedHorizon}-day outlook`;

  if (state.selectedHorizon === 7) {
    forecastNote.textContent =
      "The 7-day view follows the strongest validated signal for each commodity, while the board stays focused on simple rise-versus-soften decisions.";
  } else {
    forecastNote.textContent =
      `${state.selectedHorizon}-day view extends the graph into a longer market projection so users can compare medium-term movement without cluttering the card design.`;
  }
}

async function persistLocation(locationId) {
  await fetch("/api/location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locationId }),
  });
}

async function loadPredictions(locationId) {
  cardsGrid.innerHTML = `
    <article class="glass-panel commodity-card loading-card">
      <div class="loading-copy">Refreshing market board for ${locationId}...</div>
    </article>
  `;

  try {
    setStatus("");
    await persistLocation(locationId);
    const response = await fetch(`/api/predictions?location=${encodeURIComponent(locationId)}`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Failed to load predictions.");
    }

    state.payload = payload;
    state.selectedHorizon = Number(payload.default_horizon || 7);
    updateToggleUi();
    renderBoard();

    if (!payload.storage_status.mongo_available) {
      setStatus("MongoDB is not reachable right now. Login still works in session mode, but user records are not being persisted.", true);
    } else {
      setStatus(`Live market board updated for ${payload.location.label}.`);
    }
  } catch (error) {
    setStatus(error.message || "Something went wrong while loading predictions.", true);
    weatherSummary.innerHTML = `<div class="loading-copy">Weather could not be loaded right now.</div>`;
    marketSummary.innerHTML = `<div class="loading-copy">Market summary is temporarily unavailable.</div>`;
    cardsGrid.innerHTML = `
      <article class="glass-panel commodity-card loading-card">
        <div class="loading-copy">Prediction cards could not be loaded.</div>
      </article>
    `;
  }
}

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedHorizon = Number(button.dataset.horizon);
    updateToggleUi();
    renderBoard();
  });
});

locationSelect?.addEventListener("change", (event) => {
  loadPredictions(event.target.value);
});

updateToggleUi();
loadPredictions(bootstrap.defaultLocation || "pune");
