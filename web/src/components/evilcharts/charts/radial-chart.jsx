"use client";;
import { ChartContainer, getColorsCount, LoadingIndicator } from "@/components/evilcharts/ui/chart";
import { ChartTooltip, ChartTooltipContent } from "@/components/evilcharts/ui/tooltip";
import { ChartLegend, ChartLegendContent } from "@/components/evilcharts/ui/legend";
import { ChartBackground } from "@/components/evilcharts/ui/background";
import { createContext, use, useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  RadialBar as RechartsRadialBar,
  RadialBarChart as RechartsRadialBarChart,
  Sector,
} from "recharts";

// Constants
const DEFAULT_INNER_RADIUS = "30%";
const DEFAULT_OUTER_RADIUS = "100%";
const DEFAULT_CORNER_RADIUS = 5;
const DEFAULT_BAR_SIZE = 14;
const LOADING_BARS = 5;
// Stable empty-array reference so the `glowingBars` default doesn't change every render
const EMPTY_GLOWING_BARS = [];
const LOADING_ANIMATION_DURATION = 1500; // in milliseconds — interval between skeleton data changes

const RadialChartContext = createContext(null);

// Reads the chart context, throwing a helpful error when used outside <EvilRadialChart />
function useRadialChart() {
  const context = use(RadialChartContext);

  if (!context) {
    throw new Error(
      "Radial chart parts (<RadialBar />, <Tooltip />, …) must be used within <EvilRadialChart />"
    );
  }

  return context;
}

/**
 * Root of the composible radial chart. Owns the data, the shared context, the
 * loading skeleton, and the chart-wide arc shape. Everything visual — the
 * tooltip, legend, and the radial bar itself — is composed as children, so a
 * consumer renders exactly the parts they need.
 */
export function EvilRadialChart(
  {
    config,
    data,
    nameKey,
    children,
    className,
    chartProps,
    variant = "full",
    innerRadius = DEFAULT_INNER_RADIUS,
    outerRadius = DEFAULT_OUTER_RADIUS,
    defaultSelectedDataKey = null,
    onSelectionChange,
    isLoading = false,
    backgroundVariant
  }
) {
  const chartId = useId().replace(/:/g, ""); // colon-free id keeps CSS/SVG selectors valid
  const [selectedBar, setSelectedBar] = useState(defaultSelectedDataKey);
  const loadingData = useLoadingData(isLoading);

  const variantConfig = getVariantConfig(variant);

  // Updates selection state and notifies the parent with the bar's value
  const selectBar = useCallback((barName, value) => {
    setSelectedBar(barName);
    onSelectionChange?.(barName === null ? null : { dataKey: barName, value: value ?? 0 });
  }, [onSelectionChange]);

  // Real bars paint from a per-name gradient; the skeleton keeps the raw rows
  const preparedData = useMemo(() =>
    data.map((item) => ({
      ...item,
      fill: `url(#${chartId}-radial-colors-${item[nameKey]})`,
    })), [data, nameKey, chartId]);

  const contextValue = useMemo(() => ({
    config,
    nameKey,
    chartId,
    isLoading,
    selectedBar,
    selectBar,
  }), [config, nameKey, chartId, isLoading, selectedBar, selectBar]);

  return (
    <RadialChartContext value={contextValue}>
      <ChartContainer className={className} config={config}>
        <LoadingIndicator isLoading={isLoading} />
        <RechartsRadialBarChart
          id={chartId}
          data={isLoading ? loadingData : preparedData}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={variantConfig.startAngle}
          endAngle={variantConfig.endAngle}
          cx={variantConfig.cx}
          cy={variantConfig.cy}
          {...chartProps}>
          {backgroundVariant && <ChartBackground variant={backgroundVariant} />}
          {children}
          {isLoading && <LoadingRadialBar />}
          <defs>
            <ColorGradientStyle config={config} chartId={chartId} />
          </defs>
        </RechartsRadialBarChart>
      </ChartContainer>
    </RadialChartContext>
  );
}

/**
 * The radial bar series. Each data row becomes one bar. The series generates
 * its own glow filter definitions under the chart's unique id, so glow effects
 * never collide with other charts on the page. Pass `glowingBars` to highlight
 * specific bars and `isClickable` to make bars selectable.
 */
export function RadialBar({
  dataKey,
  cornerRadius = DEFAULT_CORNER_RADIUS,
  barSize = DEFAULT_BAR_SIZE,
  showBackground = true,
  isClickable = false,
  glowingBars = EMPTY_GLOWING_BARS,
  radialBarProps
}) {
  const { nameKey, chartId, isLoading, selectedBar, selectBar } = useRadialChart();

  // The root renders the skeleton bar while loading, so the real bar steps aside
  if (isLoading) return null;

  return (
    <>
      <RechartsRadialBar
        dataKey={dataKey}
        cornerRadius={cornerRadius}
        barSize={barSize}
        background={showBackground}
        className="drop-shadow-sm"
        style={isClickable ? { cursor: "pointer" } : undefined}
        onClick={(payload, index) => {
          if (!isClickable) return;
          const entry = payload;
          const barName = (entry?.[nameKey]) ?? String(index);
          const value = Number(entry?.[dataKey] ?? 0);
          // Clicking the selected bar clears the selection, otherwise selects it
          selectBar(selectedBar === barName ? null : barName, value);
        }}
        shape={(props) => {
          const barName = props[nameKey];
          const isGlowing = glowingBars.includes(barName);
          const isSelected = selectedBar === null || selectedBar === barName;

          return (
            <Sector
              {...props}
              filter={isGlowing ? `url(#${chartId}-radial-glow-${barName})` : undefined}
              opacity={isClickable && !isSelected ? 0.3 : 1}
              className="transition-opacity duration-200" />
          );
        }}
        {...radialBarProps} />
      <defs>
        {glowingBars.length > 0 && <GlowFilterStyle chartId={chartId} glowingBars={glowingBars} />}
      </defs>
    </>
  );
}

/**
 * The hover tooltip. Labels each bar by its name from context. Hidden
 * automatically while the chart is loading.
 */
export function Tooltip({
  variant,
  roundness,
  defaultIndex
}) {
  const { nameKey, isLoading } = useRadialChart();

  if (isLoading) return null;

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={false}
      content={
        <ChartTooltipContent nameKey={nameKey} hideLabel roundness={roundness} variant={variant} />
      } />
  );
}

/**
 * The bar legend. When `isClickable` is set, each entry toggles selection of
 * its bar, driving the shared selection state read by <RadialBar />. Hidden
 * automatically while the chart is loading.
 */
export function Legend({
  variant,
  align = "center",
  verticalAlign = "bottom",
  isClickable = false
}) {
  const { nameKey, isLoading, selectedBar, selectBar } = useRadialChart();

  if (isLoading) return null;

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedBar}
          onSelectChange={selectBar}
          isClickable={isClickable}
          nameKey={nameKey}
          variant={variant} />
      } />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant helpers
// ─────────────────────────────────────────────────────────────────────────────

// Returns the angle + center configuration for the chart's arc shape
function getVariantConfig(variant) {
  switch (variant) {
    case "semi":
      return { startAngle: 180, endAngle: 0, cx: "50%", cy: "70%" };
    case "full":
    default:
      return { startAngle: 90, endAngle: -270, cx: "50%", cy: "50%" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Style definitions — scoped to the chart's unique id
// ─────────────────────────────────────────────────────────────────────────────

/** Diagonal color gradient applied to every radial bar, one per config key. */
const ColorGradientStyle = ({
  config,
  chartId
}) => {
  return (
    <>
      {Object.entries(config).map(([dataKey, colorConfig]) => {
        const colorsCount = getColorsCount(colorConfig);

        return (
          <linearGradient
            key={`${chartId}-radial-colors-${dataKey}`}
            id={`${chartId}-radial-colors-${dataKey}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1">
            {colorsCount === 1 ? (
              <>
                <stop offset="0%" stopColor={`var(--color-${dataKey}-0)`} />
                <stop offset="100%" stopColor={`var(--color-${dataKey}-0)`} />
              </>
            ) : (
              Array.from({ length: colorsCount }, (_, index) => {
                const offset = `${(index / (colorsCount - 1)) * 100}%`;
                return (
                  <stop
                    key={offset}
                    offset={offset}
                    stopColor={`var(--color-${dataKey}-${index}, var(--color-${dataKey}-0))`} />
                );
              })
            )}
          </linearGradient>
        );
      })}
    </>
  );
};

/** Soft outer-glow SVG filter, one per glowing bar. */
const GlowFilterStyle = ({
  chartId,
  glowingBars
}) => {
  return (
    <>
      {glowingBars.map((barName) => (
        <filter
          key={`${chartId}-radial-glow-${barName}`}
          id={`${chartId}-radial-glow-${barName}`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0"
            result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      ))}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

// Builds random skeleton rows with values between 40 and 100
function generateLoadingData() {
  return Array.from({ length: LOADING_BARS }, (_, i) => ({
    name: `loading${i}`,
    value: 40 + Math.random() * 60,
  }));
}

// Hook to animate the loading skeleton data at fixed intervals
function useLoadingData(isLoading) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, LOADING_ANIMATION_DURATION);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Regenerate skeleton data whenever the interval ticks
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadingData = useMemo(() => generateLoadingData(), [tick]);

  return loadingData;
}

/**
 * The skeleton bar shown while the chart is loading. Rendered by the root in
 * place of the real <RadialBar />, with animated values and a muted fill.
 */
const LoadingRadialBar = () => {
  return (
    <RechartsRadialBar
      dataKey="value"
      cornerRadius={DEFAULT_CORNER_RADIUS}
      barSize={DEFAULT_BAR_SIZE}
      background
      isAnimationActive
      animationDuration={LOADING_ANIMATION_DURATION}
      animationEasing="ease-in-out"
      shape={(props) => <Sector {...props} fill="currentColor" fillOpacity={0.25} />} />
  );
};
