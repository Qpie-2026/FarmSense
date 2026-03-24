import { startTransition, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getForecastSummary,
  getMarketComparison,
  getMarkets,
  getOptions,
} from "../lib/api";

const HORIZON_OPTIONS = [7, 14, 30];

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value, options = { day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat("en-IN", options).format(parseDate(value));
}

function formatCurrency(value) {
  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}

function formatPercent(value) {
  const amount = Math.abs(value).toFixed(1);
  if (value > 0) return `+${amount}%`;
  if (value < 0) return `-${amount}%`;
  return `${amount}%`;
}

function buildLinePath(points) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function buildAreaPath(points, height) {
  if (points.length < 2) return "";
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  return `${buildLinePath(points)} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;
}

function buildChartGeometry(history, prediction) {
  const width = 720;
  const height = 260;
  const historySeries = history.slice(-30);
  const allPoints = [...historySeries, ...prediction];

  if (!allPoints.length) {
    return null;
  }

  const values = allPoints.map((point) => point.price);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, maxValue * 0.08, 1);
  const chartMin = minValue - range * 0.18;
  const chartMax = maxValue + range * 0.18;
  const step = allPoints.length > 1 ? width / (allPoints.length - 1) : width;

  const mapPoint = (point, index) => {
    const yRatio = (point.price - chartMin) / (chartMax - chartMin || 1);
    return {
      ...point,
      x: Number((index * step).toFixed(2)),
      y: Number((height - yRatio * height).toFixed(2)),
    };
  };

  const historyCoords = historySeries.map((point, index) => mapPoint(point, index));
  const predictionCoords = prediction.map((point, index) =>
    mapPoint(point, historyCoords.length + index)
  );
  const forecastLine = historyCoords.length
    ? [historyCoords[historyCoords.length - 1], ...predictionCoords]
    : predictionCoords;
  const marker = predictionCoords.reduce(
    (best, point) => (point.price > best.price ? point : best),
    predictionCoords[0]
  );

  return {
    width,
    height,
    historyPath: buildLinePath(historyCoords),
    forecastPath: buildLinePath(forecastLine),
    forecastArea: buildAreaPath(forecastLine, height),
    marker,
    labels: [
      historySeries[0]?.date,
      historySeries[Math.max(0, Math.floor(historySeries.length / 2))]?.date,
      historySeries[historySeries.length - 1]?.date,
      prediction[prediction.length - 1]?.date,
    ].filter(Boolean),
    guideValues: [
      Math.round(chartMax),
      Math.round(chartMin + (chartMax - chartMin) * 0.66),
      Math.round(chartMin + (chartMax - chartMin) * 0.33),
      Math.round(chartMin),
    ],
  };
}

function MetricCard({ label, value, detail, tone = "default" }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p className="eyebrow">{label}</p>
      <h3>{value}</h3>
      <p>{detail}</p>
    </article>
  );
}

function InsightCard({ title, body }) {
  return (
    <article className="insight-card">
      <p className="eyebrow">{title}</p>
      <p>{body}</p>
    </article>
  );
}

function LoadingState({ title, body }) {
  return (
    <section className="loading-view">
      <div className="loading-orb" />
      <h1>{title}</h1>
      <p>{body}</p>
    </section>
  );
}

export default function Dashboard() {
  const [options, setOptions] = useState(null);
  const [commodity, setCommodity] = useState("");
  const [markets, setMarkets] = useState([]);
  const [marketSelection, setMarketSelection] = useState({ market: "", state: "" });
  const [horizonDays, setHorizonDays] = useState(14);
  const [summary, setSummary] = useState(null);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelLoading, setPanelLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboardOptions() {
      try {
        setLoading(true);
        setError("");
        const optionPayload = await getOptions();
        const marketPayload = await getMarkets(optionPayload.default_commodity);
        if (!active) return;

        startTransition(() => {
          setOptions(optionPayload);
          setCommodity(optionPayload.default_commodity);
          setMarkets(marketPayload.markets);
          setMarketSelection(marketPayload.default_selection || optionPayload.default_selection);
        });
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboardOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!commodity) return undefined;

    setMarkets([]);

    async function loadMarketsForCommodity() {
      try {
        setError("");
        const marketPayload = await getMarkets(commodity);
        if (!active) return;

        const marketStillExists = marketPayload.markets.some(
          (market) =>
            market.market === marketSelection.market && market.state === marketSelection.state
        );

        startTransition(() => {
          setMarkets(marketPayload.markets);
          if (!marketStillExists) {
            setMarketSelection(marketPayload.default_selection);
          }
        });
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message);
      }
    }

    loadMarketsForCommodity();
    return () => {
      active = false;
    };
  }, [commodity]);

  useEffect(() => {
    let active = true;
    const hasValidSelection =
      commodity &&
      marketSelection.market &&
      marketSelection.state &&
      markets.some(
        (market) =>
          market.market === marketSelection.market && market.state === marketSelection.state
      );

    if (!hasValidSelection) return undefined;

    async function loadForecastPanels() {
      try {
        setPanelLoading(true);
        setError("");
        const [summaryPayload, comparisonPayload] = await Promise.all([
          getForecastSummary({
            commodity,
            market: marketSelection.market,
            state: marketSelection.state,
            horizonDays,
          }),
          getMarketComparison({ commodity, limit: 6 }),
        ]);

        if (!active) return;
        startTransition(() => {
          setSummary(summaryPayload);
          setComparison(comparisonPayload.markets);
        });
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message);
      } finally {
        if (active) {
          setPanelLoading(false);
        }
      }
    }

    loadForecastPanels();
    return () => {
      active = false;
    };
  }, [commodity, horizonDays, marketSelection, markets]);

  if (loading) {
    return (
      <LoadingState
        title="FarmSense is preparing your mandi forecast"
        body="Loading cleaned market history, commodity options, and the latest prediction context."
      />
    );
  }

  if (error && !summary) {
    return (
      <section className="loading-view">
        <h1>Dashboard unavailable</h1>
        <p>{error}</p>
        <Link className="ghost-link" to="/login">
          Back to sign in
        </Link>
      </section>
    );
  }

  if (!summary) {
    return (
      <LoadingState
        title="FarmSense is computing the first forecast"
        body="Generating the selected mandi summary, comparison table, and forecast curve."
      />
    );
  }

  const chart = buildChartGeometry(summary?.history ?? [], summary?.prediction ?? []);
  const selectedMarketMeta =
    markets.find(
      (market) =>
        market.market === marketSelection.market && market.state === marketSelection.state
    ) || null;

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">FS</div>
          <div>
            <p className="eyebrow">AI-ML Commodity Forecasting</p>
            <h1>FarmSense</h1>
          </div>
        </div>
        <nav className="top-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <section className="hero-grid">
        <article className="panel hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Decision Support For Farmers And Policymakers</p>
            <h2>Forecast mandi prices, compare markets, and spot the best selling window.</h2>
            <p className="hero-text">
              This working MVP uses your cleaned AGMARKNET-style dataset to turn historical mandi
              prices into short-term forecast signals and market comparison cards.
            </p>
          </div>

          <div className="hero-stats">
            <div>
              <span>Rows Processed</span>
              <strong>{options?.dataset?.clean_dataset_rows?.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span>Commodities</span>
              <strong>{options?.dataset?.commodity_count}</strong>
            </div>
            <div>
              <span>Markets</span>
              <strong>{options?.dataset?.market_count}</strong>
            </div>
          </div>

          <p className="hero-footnote">
            Data window:{" "}
            {formatDate(options.dataset.date_range.start, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            to{" "}
            {formatDate(options.dataset.date_range.end, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </article>

        <article className="panel pulse-card">
          <p className="eyebrow">Forecast Pulse</p>
          <div className="pulse-price">{formatCurrency(summary.current.price)}</div>
          <p className="pulse-label">
            Latest modal price in {summary.selection.market}, {summary.selection.state}
          </p>
          <div className="pulse-badges">
            <span className="badge badge--positive">
              {formatPercent(summary.current.change_pct_7d)} over 7 days
            </span>
            <span className="badge badge--muted">{summary.forecast.trend_direction} outlook</span>
          </div>
          <div className="pulse-grid">
            <div>
              <span>Best sell date</span>
              <strong>
                {formatDate(summary.forecast.best_sell_date, {
                  day: "numeric",
                  month: "long",
                })}
              </strong>
            </div>
            <div>
              <span>Best predicted price</span>
              <strong>{formatCurrency(summary.forecast.best_sell_price)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="control-bar">
        <label className="panel control-field control-field--commodity">
          <span className="eyebrow">Commodity</span>
          <select value={commodity} onChange={(event) => setCommodity(event.target.value)}>
            {options.commodities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <p className="control-field__preview">Selected commodity: {commodity}</p>
        </label>

        <label className="panel control-field control-field--market">
          <span className="eyebrow">Market</span>
          <select
            value={`${marketSelection.market}|||${marketSelection.state}`}
            onChange={(event) => {
              const [market, state] = event.target.value.split("|||");
              setMarketSelection({ market, state });
            }}
          >
            {markets.map((item) => (
              <option
                key={`${item.market}-${item.state}`}
                value={`${item.market}|||${item.state}`}
                disabled={!item.forecast_ready}
              >
                {item.label}
                {!item.forecast_ready ? " (limited history)" : ""}
              </option>
            ))}
          </select>
          <p className="control-field__preview">
            Selected mandi: {selectedMarketMeta?.label || `${marketSelection.market}, ${marketSelection.state}`}
          </p>
        </label>

        <article className="panel control-field control-field--static">
          <span className="eyebrow">Latest Dataset Point</span>
          <strong>
            {formatDate(summary.selection.latest_observation_date, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </strong>
          <p>Forecasts are anchored to the latest available mandi date in your processed data.</p>
        </article>

        <article className="panel control-field control-field--static">
          <span className="eyebrow">Forecast Readiness</span>
          <strong>{selectedMarketMeta?.observations ?? summary.current.series_points} daily records</strong>
          <p>
            {selectedMarketMeta?.forecast_ready
              ? "Enough history for trend-seasonality forecasting."
              : "This market needs more historical coverage for reliable forecasting."}
          </p>
        </article>
      </section>

      <section className="metrics-grid">
        <MetricCard
          label="7-Day Price Change"
          value={formatPercent(summary.current.change_pct_7d)}
          detail="Short-term momentum against the selected mandi's own daily trend."
          tone={summary.current.change_pct_7d >= 0 ? "positive" : "alert"}
        />
        <MetricCard
          label="30-Day Volatility"
          value={`${summary.current.volatility_pct_30d.toFixed(1)}%`}
          detail={`Risk level: ${summary.forecast.risk_level}`}
          tone="default"
        />
        <MetricCard
          label="Model Confidence"
          value={`${summary.forecast.confidence_score.toFixed(1)}%`}
          detail="Score blends history depth, volatility, and holdout backtest improvement."
          tone="positive"
        />
        <MetricCard
          label="Backtest Improvement"
          value={`${summary.model_metrics.improvement_pct.toFixed(1)}%`}
          detail={`Compared with naive carry-forward MAE over ${summary.model_metrics.backtest_window_days} days.`}
          tone="accent"
        />
      </section>

      <section className="recommend-grid">
        <article className="panel chart-panel">
          <div className="chart-head">
            <div>
              <p className="eyebrow">Historical vs Predicted Trend</p>
              <h3>
                {summary.selection.commodity} in {summary.selection.market}
              </h3>
              <p className="chart-subtitle">
                Showing the latest 30 days of observed prices with a forward forecast window.
              </p>
            </div>

            <div className="segment-control" role="tablist" aria-label="Forecast horizon">
              {HORIZON_OPTIONS.map((days) => (
                <button
                  key={days}
                  type="button"
                  className={days === horizonDays ? "is-active" : ""}
                  onClick={() => setHorizonDays(days)}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {chart ? (
            <div className="chart-frame">
              <div className="chart-axis-labels">
                {chart.guideValues.map((value) => (
                  <span key={value}>{formatCurrency(value)}</span>
                ))}
              </div>

              <svg className="chart-svg" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img">
                <defs>
                  <linearGradient id="forecastFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(97,217,124,0.34)" />
                    <stop offset="100%" stopColor="rgba(97,217,124,0.02)" />
                  </linearGradient>
                </defs>

                {[0, 1, 2, 3].map((lineIndex) => (
                  <line
                    key={lineIndex}
                    x1="0"
                    y1={(chart.height / 3) * lineIndex}
                    x2={chart.width}
                    y2={(chart.height / 3) * lineIndex}
                    className="chart-grid"
                  />
                ))}

                <path d={chart.forecastArea} className="chart-area" />
                <path d={chart.historyPath} className="chart-line chart-line--history" />
                <path d={chart.forecastPath} className="chart-line chart-line--forecast" />

                {chart.marker ? (
                  <>
                    <circle cx={chart.marker.x} cy={chart.marker.y} r="8" className="chart-marker-glow" />
                    <circle cx={chart.marker.x} cy={chart.marker.y} r="4.5" className="chart-marker-core" />
                  </>
                ) : null}
              </svg>

              <div className="chart-label-row">
                {chart.labels.map((label) => (
                  <span key={label}>{formatDate(label)}</span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="chart-footer">
            <div>
              <span className="eyebrow">Current modal price</span>
              <strong>{formatCurrency(summary.current.price)}</strong>
            </div>
            <div>
              <span className="eyebrow">Forecast range</span>
              <strong>
                {formatCurrency(summary.forecast.min_price)} to {formatCurrency(summary.forecast.max_price)}
              </strong>
            </div>
            <div>
              <span className="eyebrow">Panel status</span>
              <strong>{panelLoading ? "Refreshing..." : "Live from local API"}</strong>
            </div>
          </div>
        </article>

        <article className="panel recommendation-card">
          <p className="eyebrow">Recommendation Engine</p>
          <h3>{summary.forecast.trend_direction} market signal</h3>
          <p className="recommendation-text">{summary.forecast.recommendation}</p>

          <div className="recommendation-stack">
            <div className="recommendation-band">
              <span>Expected move</span>
              <strong>{formatPercent(summary.forecast.expected_change_pct)}</strong>
            </div>
            <div className="recommendation-band">
              <span>Peak selling window</span>
              <strong>
                {formatDate(summary.forecast.best_sell_date, {
                  day: "numeric",
                  month: "long",
                })}
              </strong>
            </div>
            <div className="recommendation-band">
              <span>Expected best price</span>
              <strong>{formatCurrency(summary.forecast.best_sell_price)}</strong>
            </div>
          </div>

          <p className="recommendation-note">
            Baseline model MAE: {formatCurrency(summary.model_metrics.naive_mae)}. Trend-seasonality
            MAE: {formatCurrency(summary.model_metrics.trend_seasonal_mae)}.
          </p>
        </article>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className="insights-grid">
        {summary.insights.map((insight) => (
          <InsightCard key={insight.title} title={insight.title} body={insight.body} />
        ))}
      </section>

      <section className="panel market-table-card">
        <div className="table-head">
          <div>
            <p className="eyebrow">Mandi Comparison</p>
            <h3>High-value markets for {summary.selection.commodity}</h3>
          </div>
          <p className="table-footnote">
            Compare current price levels with recent 7-day movement to spot stronger selling options.
          </p>
        </div>

        <div className="market-table">
          <div className="market-row market-row--header">
            <span>Market</span>
            <span>Current Price</span>
            <span>7-Day Change</span>
            <span>Signal</span>
          </div>

          {comparison.map((market) => (
            <button
              type="button"
              key={`${market.market}-${market.state}`}
              className={`market-row ${market.market === marketSelection.market && market.state === marketSelection.state ? "is-selected" : ""}`}
              onClick={() => setMarketSelection({ market: market.market, state: market.state })}
            >
              <span className="market-name-block">
                <strong>{market.market}</strong>
                <small>{market.state}</small>
              </span>
              <span>{formatCurrency(market.current_price)}</span>
              <span
                className={
                  market.change_pct_7d >= 0 ? "trend-chip trend-chip--positive" : "trend-chip trend-chip--alert"
                }
              >
                {formatPercent(market.change_pct_7d)}
              </span>
              <span className="signal-text">{market.signal}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
