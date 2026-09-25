"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

const chartSets = {
  Issues: {
    actual: [18, 24, 19, 31, 27, 36, 33, 42, 39],
    forecast: [39, 44, 47, 45, 53, 58],
    accent: "#63e6ff",
  },
  Commits: {
    actual: [32, 28, 45, 41, 52, 49, 61, 58, 69],
    forecast: [69, 74, 78, 83, 81, 89],
    accent: "#8bffb0",
  },
  Pulls: {
    actual: [9, 12, 11, 17, 16, 21, 20, 25, 23],
    forecast: [23, 27, 29, 31, 34, 37],
    accent: "#ff9b82",
  },
};

type MetricName = keyof typeof chartSets;

export function ForecastDemo() {
  const [metric, setMetric] = useState<MetricName>("Issues");
  const [horizon, setHorizon] = useState(60);
  const data = chartSets[metric];

  const paths = useMemo(() => {
    const visibleForecast = data.forecast.slice(
      0,
      horizon === 30 ? 2 : horizon === 60 ? 4 : 6,
    );
    const all = [...data.actual, ...visibleForecast];
    const max = Math.max(...all) * 1.12;
    const min = Math.min(...all) * 0.72;
    const range = Math.max(max - min, 1);
    const width = 560;
    const height = 208;
    const totalPoints = all.length;
    const mapPoint = (value: number, index: number) => ({
      x: (index / Math.max(totalPoints - 1, 1)) * width,
      y: height - ((value - min) / range) * height,
    });

    const actualPoints = data.actual.map(mapPoint);
    const forecastPoints = [
      actualPoints[actualPoints.length - 1],
      ...visibleForecast.map((value, index) =>
        mapPoint(value, data.actual.length + index),
      ),
    ];

    const toPath = (points: { x: number; y: number }[]) =>
      points
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`,
        )
        .join(" ");

    return {
      actual: toPath(actualPoints),
      forecast: toPath(forecastPoints),
      forecastPoints,
      latest: visibleForecast[visibleForecast.length - 1],
    };
  }, [data, horizon]);

  return (
    <div className="demo-window forecast-demo">
      <div className="demo-titlebar">
        <span className="demo-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>signal-lab / forecast</span>
        <span className="demo-live"><i /> live model</span>
      </div>

      <div className="forecast-toolbar">
        <div className="segmented-control" aria-label="Forecast metric">
          {(Object.keys(chartSets) as MetricName[]).map((name) => (
            <button
              key={name}
              type="button"
              className={metric === name ? "is-active" : ""}
              onClick={() => setMetric(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="forecast-number">
          <span>{paths.latest}</span>
          <small>projected / period</small>
        </div>
      </div>

      <div
        className="forecast-chart"
        style={{ "--chart-accent": data.accent } as CSSProperties}
      >
        <div className="chart-grid" aria-hidden="true" />
        <svg viewBox="0 0 560 208" role="img" aria-label={`${metric} forecast chart`}>
          <defs>
            <linearGradient id={`forecast-fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={data.accent} stopOpacity="0.22" />
              <stop offset="100%" stopColor={data.accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="chart-area"
            d={`${paths.actual} L560,208 L0,208 Z`}
            fill={`url(#forecast-fill-${metric})`}
          />
          <path className="chart-line chart-line-actual" d={paths.actual} />
          <path className="chart-line chart-line-forecast" d={paths.forecast} />
          {paths.forecastPoints.slice(1).map((point, index) => (
            <circle key={`${metric}-${index}`} cx={point.x} cy={point.y} r="4" />
          ))}
        </svg>
        <div className="chart-legend">
          <span><i className="actual" /> observed</span>
          <span><i className="predicted" /> predicted</span>
        </div>
      </div>

      <label className="horizon-control">
        <span>Forecast horizon</span>
        <input
          type="range"
          min="30"
          max="90"
          step="30"
          value={horizon}
          onChange={(event) => setHorizon(Number(event.target.value))}
        />
        <strong>{horizon} days</strong>
      </label>
    </div>
  );
}

const serviceScenarios = {
  order: {
    label: "Order status",
    user: "Where is order #NX-2048?",
    answer: "It cleared the Chicago distribution hub and is scheduled for delivery tomorrow, 2–5 PM.",
    detail: "Updated 4 min ago",
  },
  product: {
    label: "Product guidance",
    user: "I need a daily trainer for wider feet.",
    answer: "I would start with a cushioned neutral option in a wide fit, then compare heel drop and support preferences.",
    detail: "3 recommendations ready",
  },
  damage: {
    label: "Damage intake",
    user: "Can you check this sole separation?",
    answer: "The image appears to show adhesive separation near the forefoot. I prepared the details needed for a return review.",
    detail: "Visual intake complete",
  },
};

type ServiceScenario = keyof typeof serviceScenarios;

export function ServiceDemo() {
  const [scenario, setScenario] = useState<ServiceScenario>("order");
  const [thinking, setThinking] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const selected = serviceScenarios[scenario];

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  const selectScenario = (nextScenario: ServiceScenario) => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setThinking(true);
    setScenario(nextScenario);
    timeoutRef.current = window.setTimeout(() => {
      setThinking(false);
      timeoutRef.current = null;
    }, 520);
  };

  return (
    <div className="demo-window service-demo">
      <div className="demo-titlebar">
        <span className="demo-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>service-copilot / prototype</span>
        <span className="demo-live"><i /> online</span>
      </div>

      <div className="service-layout">
        <aside className="service-sidebar" aria-label="Demo scenarios">
          <span className="service-mark">S/AI</span>
          {(Object.keys(serviceScenarios) as ServiceScenario[]).map((key) => (
            <button
              key={key}
              type="button"
              className={scenario === key ? "is-active" : ""}
              onClick={() => selectScenario(key)}
            >
              <span>{serviceScenarios[key].label}</span>
              <i aria-hidden="true">↗</i>
            </button>
          ))}
        </aside>

        <div className="service-conversation">
          <div className="conversation-header">
            <div>
              <span className="avatar-orb">P</span>
              <p><strong>Pratiksha&apos;s service lab</strong><small>AI-assisted support concept</small></p>
            </div>
            <span className="privacy-chip">Human handoff ready</span>
          </div>

          <div className="message message-user">
            <span>You</span>
            <p>{selected.user}</p>
          </div>

          <div className="message message-ai" aria-live="polite">
            <span>Copilot</span>
            {thinking ? (
              <div className="typing-dots" aria-label="Thinking"><i /><i /><i /></div>
            ) : (
              <>
                <p>{selected.answer}</p>
                <div className="service-result">
                  <span className="scan-thumbnail"><i /></span>
                  <span><strong>{selected.detail}</strong><small>Review before sending</small></span>
                  <button type="button" aria-label="Open demo result">→</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const coverageOptions = {
  Essential: { multiplier: 0.88, detail: "Liability + core protection" },
  Balanced: { multiplier: 1, detail: "Collision + practical extras" },
  Complete: { multiplier: 1.24, detail: "Comprehensive + full support" },
};

type Coverage = keyof typeof coverageOptions;

export function InsuranceDemo() {
  const [coverage, setCoverage] = useState<Coverage>("Balanced");
  const [age, setAge] = useState(31);
  const [miles, setMiles] = useState(24);

  const quote = useMemo(() => {
    const ageFactor = age < 25 ? 1.32 : age > 60 ? 1.14 : 1;
    const mileageFactor = 0.86 + Math.min(miles, 70) / 210;
    return Math.round(118 * coverageOptions[coverage].multiplier * ageFactor * mileageFactor);
  }, [age, coverage, miles]);

  const score = Math.max(62, Math.min(96, 94 - Math.round(miles / 5) - (age < 25 ? 8 : 0)));

  return (
    <div className="demo-window insurance-demo">
      <div className="demo-titlebar">
        <span className="demo-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>quote-flow / interactive</span>
        <span>Step 4 of 5</span>
      </div>

      <div className="insurance-body">
        <div className="insurance-progress" aria-label="Quote progress">
          {["You", "Vehicle", "Driver", "Coverage", "Review"].map((step, index) => (
            <span key={step} className={index <= 3 ? "is-complete" : ""}>
              <i>{index < 3 ? "✓" : index + 1}</i>{step}
            </span>
          ))}
        </div>

        <div className="insurance-grid">
          <div className="coverage-panel">
            <p className="demo-kicker">Choose a coverage direction</p>
            <h4>Protection that fits the way you drive.</h4>
            <div className="coverage-options">
              {(Object.keys(coverageOptions) as Coverage[]).map((option) => (
                <button
                  type="button"
                  key={option}
                  className={coverage === option ? "is-active" : ""}
                  onClick={() => setCoverage(option)}
                >
                  <span><i />{option}</span>
                  <small>{coverageOptions[option].detail}</small>
                </button>
              ))}
            </div>

            <div className="quote-sliders">
              <label>
                <span>Driver age <strong>{age}</strong></span>
                <input type="range" min="18" max="75" value={age} onChange={(event) => setAge(Number(event.target.value))} />
              </label>
              <label>
                <span>Daily miles <strong>{miles}</strong></span>
                <input type="range" min="4" max="70" value={miles} onChange={(event) => setMiles(Number(event.target.value))} />
              </label>
            </div>
          </div>

          <aside className="quote-card">
            <span className="quote-card-label">Live estimate</span>
            <div className="quote-price"><sup>$</sup>{quote}<small>/mo</small></div>
            <div className="risk-score">
              <div className="risk-ring" style={{ "--risk": `${score * 3.6}deg` } as CSSProperties}>
                <span>{score}</span>
              </div>
              <p><strong>Profile score</strong><small>Updates with your choices</small></p>
            </div>
            <ul>
              <li><span>Coverage</span><strong>{coverage}</strong></li>
              <li><span>Deductible</span><strong>$500</strong></li>
              <li><span>Roadside</span><strong>Included</strong></li>
            </ul>
            <button type="button">Review quote <span>→</span></button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function ProjectDemo({ type }: { type: "forecast" | "service" | "insurance" }) {
  if (type === "forecast") return <ForecastDemo />;
  if (type === "service") return <ServiceDemo />;
  return <InsuranceDemo />;
}
