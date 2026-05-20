"use client";;
import { ChartContainer, getColorsCount, getLoadingData, LoadingIndicator } from "@/components/evilcharts/ui/chart";
import { EvilBrush, useEvilBrush } from "@/components/evilcharts/ui/evil-brush";
import { ChartLegend, ChartLegendContent } from "@/components/evilcharts/ui/legend";
import { ChartTooltip, ChartTooltipContent } from "@/components/evilcharts/ui/tooltip";
import { ChartDot } from "@/components/evilcharts/ui/dot";
import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Bar as RechartsBar,
  CartesianGrid,
  ComposedChart as RechartsComposedChart,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";
import { motion, useReducedMotion } from "motion/react";

// Constants
const STROKE_WIDTH = 2;
const DEFAULT_BAR_RADIUS = 4;
const LOADING_DATA_KEY = "loading";
const LOADING_ANIMATION_DURATION = 2000; // in milliseconds
const REVEAL_DURATION = 1; // line intro wipe length, in seconds
const REVEAL_EASE = [0, 0.7, 0.5, 1]; // intro easing
const BAR_GROW_DURATION = 0.5; // per-bar grow-in length, in seconds
const BAR_STAGGER = 0.05; // delay between consecutive bars, in seconds

const ComposedChartContext = createContext(null);

// Reads the chart context, throwing a helpful error when used outside <EvilComposedChart />
function useComposedChart() {
  const context = use(ComposedChartContext);

  if (!context) {
    throw new Error(
      "Composed chart parts (<Bar />, <Line />, <XAxis />, …) must be used within <EvilComposedChart />"
    );
  }

  return context;
}

/**
 * Root of the composible composed chart. Owns the data, the shared context, the
 * loading skeleton, and the optional zoom brush. Everything visual — axes, grid,
 * tooltip, legend, and the bars and lines themselves — is composed as children,
 * so a consumer renders exactly the parts they need.
 */
export function EvilComposedChart(
  {
    config,
    data,
    children,
    className,
    chartProps,
    curveType = "linear",
    animationType = "left-to-right",
    barGap,
    barCategoryGap,
    defaultSelectedDataKey = null,
    onSelectionChange,
    isLoading = false,
    loadingBars,
    showBrush = false,
    xDataKey,
    brushHeight,
    brushFormatLabel,
    onBrushChange
  }
) {
  const chartId = useId().replace(/:/g, ""); // colon-free id keeps CSS/SVG selectors valid
  // Anchors the intro to a fixed moment so it plays exactly once — re-renders
  // and Recharts remounts read elapsed time from here instead of replaying.
  const [introStartedAt] = useState(() => Date.now());
  const [selectedDataKey, setSelectedDataKey] = useState(defaultSelectedDataKey);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { loadingData, onShimmerExit } = useLoadingData(isLoading, loadingBars);
  const { visibleData, brushProps } = useEvilBrush({ data });

  const displayData = showBrush && !isLoading ? visibleData : data;

  // Updates selection state and notifies the parent
  const selectDataKey = useCallback((newSelectedDataKey) => {
    setSelectedDataKey(newSelectedDataKey);
    onSelectionChange?.(newSelectedDataKey);
  }, [onSelectionChange]);

  const contextValue = useMemo(() => ({
    config,
    curveType,
    animationType,
    introStartedAt,
    dataLength: displayData.length,
    isLoading,
    hoveredIndex,
    selectedDataKey,
    selectDataKey,
  }), [
    config,
    curveType,
    animationType,
    introStartedAt,
    displayData.length,
    isLoading,
    hoveredIndex,
    selectedDataKey,
    selectDataKey,
  ]);

  return (
    <ComposedChartContext value={contextValue}>
      <ChartContainer
        className={className}
        config={config}
        footer={
          showBrush &&
          !isLoading && (
            <EvilBrush
              data={data}
              chartConfig={config}
              xDataKey={xDataKey}
              variant="area"
              curveType={curveType}
              height={brushHeight}
              formatLabel={brushFormatLabel}
              skipStyle
              className="mt-1"
              {...brushProps}
              onChange={(range) => {
                brushProps.onChange(range);
                onBrushChange?.(range);
              }} />
          )
        }>
        <LoadingIndicator isLoading={isLoading} />
        <RechartsComposedChart
          id={chartId}
          accessibilityLayer
          data={isLoading ? loadingData : displayData}
          barGap={barGap}
          barCategoryGap={barCategoryGap}
          onMouseLeave={() => setHoveredIndex(null)}
          {...chartProps}>
          {children}
          {isLoading && (
            <LoadingBar
              chartId={chartId}
              barRadius={DEFAULT_BAR_RADIUS}
              onShimmerExit={onShimmerExit} />
          )}
        </RechartsComposedChart>
      </ChartContainer>
    </ComposedChartContext>
  );
}

/**
 * A single bar series. Each <Bar /> is fully self-contained: it generates its
 * own gradient/pattern definitions under a unique id, so any number of bars —
 * each with its own variant, glow, and clickability — can live in one chart
 * without style collisions.
 */
export function Bar({
  dataKey,
  variant = "default",
  radius = DEFAULT_BAR_RADIUS,
  glow = false,
  animationType,
  isClickable = false,
  enableHoverHighlight = false,
  barProps
}) {
  const {
    config,
    animationType: defaultAnimation,
    introStartedAt,
    dataLength,
    isLoading,
    hoveredIndex,
    selectedDataKey,
    selectDataKey,
  } = useComposedChart();
  const id = useId().replace(/:/g, ""); // unique id scopes this bar's style defs
  // Devices set to "reduce motion" skip the grow-in animation entirely
  const shouldReduceMotion = useReducedMotion();

  // The root renders the skeleton bar while loading, so real bars step aside
  if (isLoading) return null;

  const isSelected = selectedDataKey === null || selectedDataKey === dataKey;
  const filter = glow ? `url(#${id}-glow)` : undefined;

  // The grow-in is a per-frame animation — heavier than a static chart — so
  // `"none"` and the OS reduce-motion preference both opt out of it.
  const revealType = shouldReduceMotion
    ? "none"
    : (animationType ?? defaultAnimation);

  return (
    <>
      <RechartsBar
        dataKey={dataKey}
        fill={`url(#${id}-bar-colors)`}
        radius={radius}
        // Recharts' built-in bar animation is permanently disabled — every bar
        // instead grows in from its baseline via the staggered motion.dev shape.
        isAnimationActive={false}
        style={isClickable || enableHoverHighlight ? { cursor: "pointer" } : undefined}
        shape={(props) => {
          const barShapeProps = props;
          const index = typeof barShapeProps.index === "number" ? barShapeProps.index : -1;

          return (
            <CustomBar
              {...barShapeProps}
              id={id}
              variant={variant}
              barRadius={radius}
              filter={filter}
              fillOpacity={getBarOpacity({
                isClickable,
                isSelected,
                selectedDataKey,
                enableHoverHighlight,
                hoveredIndex,
                index,
              })}
              isClickable={isClickable}
              enableHoverHighlight={enableHoverHighlight}
              animationType={revealType}
              dataLength={dataLength}
              introStartedAt={introStartedAt}
              onClick={() => {
                if (!isClickable) return;
                selectDataKey(selectedDataKey === dataKey ? null : dataKey);
              }} />
          );
        }}
        {...barProps} />
      <defs>
        <VerticalColorGradient id={id} dataKey={dataKey} config={config} />
        {variant === "hatched" && <HatchedPattern id={id} dataKey={dataKey} />}
        {variant === "duotone" && <DuotonePattern id={id} dataKey={dataKey} config={config} />}
        {variant === "duotone-reverse" && (
          <DuotoneReversePattern id={id} dataKey={dataKey} config={config} />
        )}
        {variant === "gradient" && <GradientPattern id={id} dataKey={dataKey} />}
        {variant === "stripped" && <StrippedPattern id={id} dataKey={dataKey} />}
        {glow && <BarGlowFilter id={id} />}
      </defs>
    </>
  );
}

/**
 * A single line series. Each <Line /> is fully self-contained: it generates its
 * own color gradient and glow filter under a unique id, so any number of lines —
 * each with its own stroke, curve, glow, and clickability — can live in one chart
 * without style collisions. Compose <Dot /> and <ActiveDot /> inside it to add
 * point markers.
 */
export function Line({
  dataKey,
  strokeVariant = "solid",
  curveType,
  animationType,
  connectNulls = false,
  glow = false,
  isClickable = false,
  children,
  lineProps
}) {
  const {
    config,
    curveType: defaultCurve,
    animationType: defaultAnimation,
    isLoading,
    selectedDataKey,
    selectDataKey,
  } = useComposedChart();
  const id = useId().replace(/:/g, ""); // unique id scopes this line's style defs
  // Devices set to "reduce motion" skip the intro reveal entirely
  const shouldReduceMotion = useReducedMotion();

  // The root renders the skeleton bar while loading, so real lines step aside
  if (isLoading) return null;

  const resolvedCurve = curveType ?? defaultCurve;

  // The reveal is an animated SVG mask — heavier than a static chart — so
  // `"none"` and the OS reduce-motion preference both opt out of it.
  const revealType = shouldReduceMotion
    ? "none"
    : (animationType ?? defaultAnimation);
  const maskId = revealType === "none" ? undefined : `${id}-reveal-mask`;

  const opacity = getOpacity(selectedDataKey, dataKey);
  const hasSelection = selectedDataKey !== null;
  const filter = glow ? `url(#${id}-glow)` : undefined;

  const { dot, activeDot } = resolveDots(children, id, dataKey, opacity.dot, maskId);

  const isAnimatedDashed = strokeVariant === "animated-dashed";
  const isDashed = strokeVariant === "dashed" || isAnimatedDashed;

  const handleLineClick = () => {
    if (!isClickable) return;
    selectDataKey(selectedDataKey === dataKey ? null : dataKey);
  };

  return (
    <>
      {isClickable && (
        <RechartsLine
          type={resolvedCurve}
          dataKey={dataKey}
          connectNulls={connectNulls}
          stroke="transparent"
          strokeWidth={20}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
          legendType="none"
          tooltipType="none"
          style={{ cursor: "pointer" }}
          onClick={handleLineClick} />
      )}
      <RechartsLine
        type={resolvedCurve}
        dataKey={dataKey}
        connectNulls={connectNulls}
        strokeOpacity={opacity.stroke}
        stroke={`url(#${id}-line-colors-${dataKey})`}
        filter={filter}
        dot={dot}
        activeDot={activeDot}
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={isDashed ? "5 5" : undefined}
        // Recharts' built-in line animation is permanently disabled — the
        // motion.dev reveal mask drives the intro, wiping stroke and dots in together.
        isAnimationActive={false}
        style={{
          ...(maskId ? { mask: `url(#${maskId})` } : {}),
          ...(isClickable ? { cursor: "pointer", pointerEvents: "none" } : {}),
        }}
        {...lineProps}>
        {isAnimatedDashed && !hasSelection && <AnimatedDashedStroke />}
      </RechartsLine>
      <defs>
        {revealType !== "none" && <RevealMask id={id} type={revealType} />}
        <HorizontalColorGradient id={id} dataKey={dataKey} config={config} />
        {glow && <LineGlowFilter id={id} />}
      </defs>
    </>
  );
}

/**
 * Declares a resting point marker for the <Line /> it is composed inside.
 * It renders nothing on its own — the parent <Line /> reads its variant and
 * wires it into the Recharts dot slot.
 */
export const Dot = () => null;

/**
 * Declares the hovered/active point marker for the <Line /> it is composed
 * inside. Like <Dot />, it is a configuration slot and renders nothing itself.
 */
export const ActiveDot = () => null;

/**
 * The horizontal category axis. Ships with the chart's flat default styling and
 * forwards every Recharts XAxis prop, so `dataKey`, `tickFormatter`, etc. are
 * passed straight through. Hidden automatically while the chart is loading.
 */
export function XAxis({
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  minTickGap = 8,
  ...props
}) {
  const { isLoading } = useComposedChart();

  if (isLoading) return null;

  return (
    <RechartsXAxis
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      minTickGap={minTickGap}
      {...props} />
  );
}

/**
 * The vertical value axis. Forwards every Recharts YAxis prop straight through.
 * Hidden automatically while the chart is loading.
 */
export function YAxis({
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  minTickGap = 8,
  width = "auto",
  ...props
}) {
  const { isLoading } = useComposedChart();

  if (isLoading) return null;

  return (
    <RechartsYAxis
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      minTickGap={minTickGap}
      width={width}
      {...props} />
  );
}

/**
 * The background grid lines. Defaults to horizontal-only dashed lines and
 * forwards every Recharts CartesianGrid prop for full control.
 */
export function Grid({
  vertical = false,
  strokeDasharray = "3 3",
  ...props
}) {
  return <CartesianGrid vertical={vertical} strokeDasharray={strokeDasharray} {...props} />;
}

/**
 * The hover tooltip. Reads the chart's selection from context so its content
 * dims unselected series. Hidden automatically while the chart is loading.
 */
export function Tooltip({
  variant,
  roundness,
  defaultIndex,
  cursor = true
}) {
  const { isLoading, selectedDataKey } = useComposedChart();

  if (isLoading) return null;

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={cursor ? { strokeDasharray: "3 3", strokeWidth: STROKE_WIDTH } : false}
      content={
        <ChartTooltipContent selected={selectedDataKey} roundness={roundness} variant={variant} />
      } />
  );
}

/**
 * The series legend. When `isClickable` is set, each entry toggles selection of
 * its series, driving the shared selection state read by every <Bar /> and <Line />.
 */
export function Legend({
  variant,
  align = "right",
  verticalAlign = "top",
  isClickable = false
}) {
  const { selectedDataKey, selectDataKey } = useComposedChart();

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedDataKey}
          onSelectChange={selectDataKey}
          isClickable={isClickable}
          variant={variant} />
      } />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Selection + dot helpers
// ─────────────────────────────────────────────────────────────────────────────

// Returns stroke/dot opacity for a line — dims a series only when another is selected
const getOpacity = (selectedDataKey, dataKey) => {
  if (selectedDataKey === null) {
    return { stroke: 1, dot: 1 };
  }

  return selectedDataKey === dataKey ? { stroke: 1, dot: 1 } : { stroke: 0.3, dot: 0.3 };
};

// Returns the fill opacity for a bar, accounting for both selection and hover state
const getBarOpacity = ({
  isClickable,
  isSelected,
  selectedDataKey,
  enableHoverHighlight,
  hoveredIndex,
  index
}) => {
  const clickOpacity = isClickable && selectedDataKey !== null ? (isSelected ? 1 : 0.3) : 1;

  if (enableHoverHighlight && hoveredIndex !== null) {
    return hoveredIndex === index ? clickOpacity : clickOpacity * 0.3;
  }

  return clickOpacity;
};

// Pulls <Dot /> and <ActiveDot /> out of a line's children into Recharts dot slots.
// When a `maskId` is given the resting dot is wired to the intro reveal mask so it
// wipes in with the line; the active dot is always left unmasked since it only
// appears on hover, after the intro has finished.
const resolveDots = (children, id, dataKey, dotOpacity, maskId) => {
  let dot = false;
  let activeDot = false;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (child.type === Dot) {
      const { variant } = (child).props;
      dot = (
        <ChartDot
          type={variant}
          dataKey={dataKey}
          chartId={`${id}-line`}
          fillOpacity={dotOpacity}
          maskId={maskId} />
      );
    }

    if (child.type === ActiveDot) {
      const { variant } = (child).props;
      activeDot = (
        <ChartDot
          type={variant}
          dataKey={dataKey}
          chartId={`${id}-line`}
          fillOpacity={dotOpacity} />
      );
    }
  });

  return { dot, activeDot };
};

// Renders a single bar rectangle with its variant fill, glow, and hit area
const CustomBar = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fillOpacity = 1,
  background,
  index = -1,
  id,
  variant,
  barRadius,
  filter,
  isClickable,
  enableHoverHighlight,
  animationType = "none",
  dataLength = 0,
  introStartedAt = 0,
  onClick
}) => {
  const cursorStyle = isClickable || enableHoverHighlight ? { cursor: "pointer" } : undefined;
  const hitAreaX = background?.x ?? x;
  const hitAreaY = background?.y ?? y;
  const hitAreaWidth = background?.width ?? width;
  const hitAreaHeight = background?.height ?? height;

  // motion.dev grow-in props for this bar — an empty object once it has finished
  const grow = getBarGrowAnimation(animationType, index, dataLength, introStartedAt) ?? {};

  const getFill = () => {
    switch (variant) {
      case "hatched":
        return `url(#${id}-hatched)`;
      case "duotone":
        return `url(#${id}-duotone)`;
      case "duotone-reverse":
        return `url(#${id}-duotone-reverse)`;
      case "gradient":
        return `url(#${id}-gradient)`;
      case "stripped":
        return `url(#${id}-stripped)`;
      default:
        return `url(#${id}-bar-colors)`;
    }
  };

  // Full-height invisible rect — keeps the column hoverable even mid grow-in
  const hitArea = enableHoverHighlight ? (
    <rect
      x={hitAreaX}
      y={hitAreaY}
      width={hitAreaWidth}
      height={hitAreaHeight}
      fill="transparent" />
  ) : null;

  if (variant === "stripped") {
    return (
      <g style={cursorStyle} onClick={onClick}>
        <motion.g
          {...grow}
          filter={filter}
          opacity={fillOpacity}
          className="transition-opacity duration-200">
          <rect x={x} y={y} width={width} height={height} fill={getFill()} />
          <rect x={x} y={y} width={width} height={2} fill={`url(#${id}-bar-colors)`} />
        </motion.g>
        {hitArea}
      </g>
    );
  }

  return (
    <g style={cursorStyle} onClick={onClick}>
      <motion.g {...grow}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={barRadius}
          ry={barRadius}
          fill={getFill()}
          opacity={fillOpacity}
          filter={filter}
          className="transition-opacity duration-200" />
      </motion.g>
      {hitArea}
    </g>
  );
};

/**
 * Builds the motion.dev grow-in animation for a single bar, or returns `null`
 * when it should render statically (`"none"`, an unknown index, or — crucially —
 * once the bar has already finished growing).
 *
 * The intro is anchored to `introStartedAt` (stamped once when the chart mounts)
 * rather than to component mount. Recharts remounts every bar whenever the chart
 * re-renders, so a mount-based animation would replay endlessly; reading elapsed
 * time instead makes it a true one-shot — a bar past its window renders static,
 * a bar caught mid-grow resumes from where it should already be.
 */
const getBarGrowAnimation = (
  animationType,
  index,
  dataLength,
  introStartedAt,
) => {
  if (animationType === "none" || index < 0 || dataLength <= 0) return null;

  const lastIndex = dataLength - 1;
  const center = lastIndex / 2;

  // How many bars this one waits behind before it starts growing
  let step;
  switch (animationType) {
    case "right-to-left":
      step = lastIndex - index;
      break;
    case "center-out":
      step = Math.abs(index - center);
      break;
    case "edges-in":
      step = center - Math.abs(index - center);
      break;
    default: // left-to-right
      step = index;
  }

  const startMs = step * BAR_STAGGER * 1000;
  const durationMs = BAR_GROW_DURATION * 1000;
  const endMs = startMs + durationMs;
  const elapsed = Date.now() - introStartedAt;

  // Already finished — render static so re-renders/remounts can't replay it
  if (elapsed >= endMs) return null;

  // Resume from wherever this bar should already be (0 before it starts)
  const from = elapsed <= startMs ? 0 : (elapsed - startMs) / durationMs;

  return {
    initial: { scaleY: from },
    animate: { scaleY: 1 },
    transition: {
      duration: (endMs - Math.max(elapsed, startMs)) / 1000,
      ease: REVEAL_EASE,
      delay: Math.max(0, startMs - elapsed) / 1000,
    },
    style: { originY: 1 }, // grow upward from the baseline
  };
};

// motion `originX` for each single-rect line reveal — the edge the wipe grows from
const SINGLE_REVEAL_ORIGIN = {
  "left-to-right": 0,
  "right-to-left": 1,
  "center-out": 0.5,
};

/**
 * Wipe mask driven by motion.dev, played once when a <Line /> mounts. The same
 * mask is applied to the line's stroke and its resting dots so both reveal in
 * lockstep, replacing Recharts' built-in animation.
 */
const RevealMask = ({
  id,
  type
}) => {
  const reveal = {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: REVEAL_DURATION, ease: REVEAL_EASE },
  };

  return (
    <mask
      id={`${id}-reveal-mask`}
      maskUnits="userSpaceOnUse"
      maskContentUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="100%"
      height="100%">
      {type === "edges-in" ? (
        <>
          {/* left half wipes inward from the left edge toward the centre */}
          <motion.rect
            {...reveal}
            x="0"
            y="0"
            width="50%"
            height="100%"
            fill="white"
            style={{ originX: 0 }} />
          {/* right half wipes inward from the right edge toward the centre */}
          <motion.rect
            {...reveal}
            x="50%"
            y="0"
            width="50%"
            height="100%"
            fill="white"
            style={{ originX: 1 }} />
        </>
      ) : (
        <motion.rect
          {...reveal}
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="white"
          style={{ originX: SINGLE_REVEAL_ORIGIN[type] }} />
      )}
    </mask>
  );
};

// Animated dashed-stroke effect, rendered as a child of the Recharts Line
const AnimatedDashedStroke = () => {
  return (
    <>
      <animate
        attributeName="stroke-dasharray"
        values="5 5; 0 5; 5 5"
        dur="1s"
        repeatCount="indefinite"
        keyTimes="0;0.5;1" />
      <animate
        attributeName="stroke-dashoffset"
        values="0; -10"
        dur="1s"
        repeatCount="indefinite"
        keyTimes="0;1" />
    </>
  );
};

/** Vertical top-to-bottom color gradient — the fill source for every bar variant. */
const VerticalColorGradient = ({
  id,
  dataKey,
  config
}) => {
  const colorsCount = getColorsCount(config[dataKey] ?? {});

  return (
    <linearGradient id={`${id}-bar-colors`} x1="0" y1="0" x2="0" y2="1">
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
};

/** Horizontal left-to-right color gradient — the stroke source for a line series. */
const HorizontalColorGradient = ({
  id,
  dataKey,
  config
}) => {
  const colorsCount = getColorsCount(config[dataKey] ?? {});

  return (
    <linearGradient id={`${id}-line-colors-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
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
};

/** Hatched diagonal-stripe fill for a bar, masked from the series color gradient. */
const HatchedPattern = ({
  id
}) => {
  return (
    <>
      <pattern
        id={`${id}-hatched-mask-pattern`}
        x="0"
        y="0"
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-45)">
        <rect width="5" height="5" fill="white" fillOpacity={0.3} />
        <rect width="1.5" height="5" fill="white" fillOpacity={1} />
      </pattern>
      <mask id={`${id}-hatched-mask`}>
        <rect width="100%" height="100%" fill={`url(#${id}-hatched-mask-pattern)`} />
      </mask>
      <pattern
        id={`${id}-hatched`}
        patternUnits="userSpaceOnUse"
        width="100%"
        height="100%">
        <rect
          width="100%"
          height="100%"
          fill={`url(#${id}-bar-colors)`}
          mask={`url(#${id}-hatched-mask)`} />
      </pattern>
    </>
  );
};

/** Two-tone fill that splits each bar into a light and a full-strength half. */
const DuotonePattern = ({
  id,
  dataKey,
  config
}) => {
  const colorsCount = getColorsCount(config[dataKey] ?? {});

  return (
    <>
      <linearGradient
        id={`${id}-duotone-mask-gradient`}
        gradientUnits="objectBoundingBox"
        x1="0"
        y1="0"
        x2="1"
        y2="0">
        <stop offset="50%" stopColor="white" stopOpacity={0.4} />
        <stop offset="50%" stopColor="white" stopOpacity={1} />
      </linearGradient>
      <linearGradient
        id={`${id}-duotone-colors`}
        gradientUnits="objectBoundingBox"
        x1="0"
        y1="0"
        x2="0"
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
      <mask id={`${id}-duotone-mask`} maskContentUnits="objectBoundingBox">
        <rect
          x="0"
          y="0"
          width="1"
          height="1"
          fill={`url(#${id}-duotone-mask-gradient)`} />
      </mask>
      <pattern
        id={`${id}-duotone`}
        patternUnits="objectBoundingBox"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1">
        <rect
          x="0"
          y="0"
          width="1"
          height="1"
          fill={`url(#${id}-duotone-colors)`}
          mask={`url(#${id}-duotone-mask)`} />
      </pattern>
    </>
  );
};

/** Two-tone fill mirrored from `duotone` — the full-strength half comes first. */
const DuotoneReversePattern = ({
  id,
  dataKey,
  config
}) => {
  const colorsCount = getColorsCount(config[dataKey] ?? {});

  return (
    <>
      <linearGradient
        id={`${id}-duotone-reverse-mask-gradient`}
        gradientUnits="objectBoundingBox"
        x1="0"
        y1="0"
        x2="1"
        y2="0">
        <stop offset="50%" stopColor="white" stopOpacity={1} />
        <stop offset="50%" stopColor="white" stopOpacity={0.4} />
      </linearGradient>
      <linearGradient
        id={`${id}-duotone-reverse-colors`}
        gradientUnits="objectBoundingBox"
        x1="0"
        y1="0"
        x2="0"
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
      <mask id={`${id}-duotone-reverse-mask`} maskContentUnits="objectBoundingBox">
        <rect
          x="0"
          y="0"
          width="1"
          height="1"
          fill={`url(#${id}-duotone-reverse-mask-gradient)`} />
      </mask>
      <pattern
        id={`${id}-duotone-reverse`}
        patternUnits="objectBoundingBox"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1">
        <rect
          x="0"
          y="0"
          width="1"
          height="1"
          fill={`url(#${id}-duotone-reverse-colors)`}
          mask={`url(#${id}-duotone-reverse-mask)`} />
      </pattern>
    </>
  );
};

/** Gradient fill for a bar that fades from visible at the top toward transparent. */
const GradientPattern = ({
  id
}) => {
  return (
    <>
      <linearGradient id={`${id}-gradient-mask-gradient`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="20%" stopColor="white" stopOpacity={1} />
        <stop offset="90%" stopColor="white" stopOpacity={0} />
      </linearGradient>
      <mask id={`${id}-gradient-mask`}>
        <rect width="100%" height="100%" fill={`url(#${id}-gradient-mask-gradient)`} />
      </mask>
      <pattern
        id={`${id}-gradient`}
        patternUnits="userSpaceOnUse"
        width="100%"
        height="100%">
        <rect
          width="100%"
          height="100%"
          fill={`url(#${id}-bar-colors)`}
          mask={`url(#${id}-gradient-mask)`} />
      </pattern>
    </>
  );
};

/** Low-opacity gradient fill paired with the solid top strip drawn by `CustomBar`. */
const StrippedPattern = ({
  id
}) => {
  return (
    <>
      <linearGradient id={`${id}-stripped-mask-gradient`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity={0.4} />
        <stop offset="100%" stopColor="white" stopOpacity={0.1} />
      </linearGradient>
      <mask id={`${id}-stripped-mask`}>
        <rect width="100%" height="100%" fill={`url(#${id}-stripped-mask-gradient)`} />
      </mask>
      <pattern
        id={`${id}-stripped`}
        patternUnits="userSpaceOnUse"
        width="100%"
        height="100%">
        <rect
          width="100%"
          height="100%"
          fill={`url(#${id}-bar-colors)`}
          mask={`url(#${id}-stripped-mask)`} />
      </pattern>
    </>
  );
};

/** Soft outer-glow filter applied to a glowing bar. */
const BarGlowFilter = ({
  id
}) => {
  return (
    <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"
        result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
};

/** Soft outer-glow filter applied to a glowing line. */
const LineGlowFilter = ({
  id
}) => {
  return (
    <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2 0"
        result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

// Builds bell-curve eased gradient stops for the loading shimmer
const generateEasedGradientStops = (
  steps = 17,
  minOpacity = 0.05,
  maxOpacity = 0.9,
) => {
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1); // 0 to 1
    // Sine-based bell curve easing: peaks at center (t=0.5), smooth falloff at edges
    const eased = Math.sin(t * Math.PI) ** 2;
    const opacity = minOpacity + eased * (maxOpacity - minOpacity);
    return { offset: `${(t * 100).toFixed(0)}%`, opacity: Number(opacity.toFixed(3)) };
  });
};

/**
 * Hook to manage loading data with pixel-perfect shimmer synchronization.
 *
 * Uses motion.dev's onUpdate callback to ensure chart data is only regenerated
 * when the shimmer has completely exited the visible area. This eliminates
 * timing drift issues from setTimeout/setInterval.
 */
export function useLoadingData(isLoading, loadingBars = 12) {
  const [loadingDataKey, setLoadingDataKey] = useState(false);

  // Callback fired by motion.dev when the shimmer exits the visible area
  const onShimmerExit = useCallback(() => {
    if (isLoading) {
      setLoadingDataKey((prev) => !prev);
    }
  }, [isLoading]);

  const loadingData = useMemo(
    () => getLoadingData(loadingBars, 20, 80),
    // loadingDataKey toggle triggers re-computation when the shimmer exits
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadingBars, loadingDataKey]
  );

  return { loadingData, onShimmerExit };
}

/**
 * The skeleton bar shown while the chart is loading. Rendered by the root in
 * place of the real bars and lines, paired with its own masked shimmer pattern.
 */
const LoadingBar = ({
  chartId,
  barRadius,
  onShimmerExit
}) => {
  return (
    <>
      <RechartsBar
        dataKey={LOADING_DATA_KEY}
        fill="currentColor"
        fillOpacity={0.15}
        radius={barRadius}
        isAnimationActive={false}
        legendType="none"
        style={{ mask: `url(#${chartId}-loading-mask)` }} />
      <defs>
        <LoadingPattern chartId={chartId} onShimmerExit={onShimmerExit} />
      </defs>
    </>
  );
};

/**
 * Animated shimmer pattern for the loading skeleton.
 *
 * The visible chart area is normalized to 0-1, the shimmer gradient has width 1,
 * and the pattern is 3x wide so the shimmer has buffer on both sides. The motion
 * rect travels x from -1 to 2; onShimmerExit fires as it crosses x=1, letting the
 * data swap happen while the shimmer is off-screen for a seamless loop.
 */
const LoadingPattern = ({
  chartId,
  onShimmerExit
}) => {
  const gradientStops = generateEasedGradientStops();

  // 1 (left buffer) + 1 (visible) + 1 (right buffer)
  const patternWidth = 3;
  const startX = -1;
  const endX = 2;

  // Tracks the last x value to detect the exit threshold crossing
  const lastXRef = useRef(startX);

  return (
    <>
      <linearGradient id={`${chartId}-loading-gradient`} x1="0" y1="0" x2="1" y2="0">
        {gradientStops.map(({ offset, opacity }) => (
          <stop key={offset} offset={offset} stopColor="white" stopOpacity={opacity} />
        ))}
      </linearGradient>
      <pattern
        id={`${chartId}-loading-pattern`}
        patternUnits="objectBoundingBox"
        patternContentUnits="objectBoundingBox"
        patternTransform="rotate(25)"
        width={patternWidth}
        height="1"
        x="0"
        y="0">
        <motion.rect
          y="0"
          width="1"
          height="1"
          fill={`url(#${chartId}-loading-gradient)`}
          initial={{ x: startX }}
          animate={{ x: endX }}
          transition={{
            duration: LOADING_ANIMATION_DURATION / 1000,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
          onUpdate={(latest) => {
            const xValue = typeof latest.x === "number" ? latest.x : startX;
            const lastX = lastXRef.current;

            // Fire once per loop, when the shimmer fully exits the visible area
            if (xValue >= 1 && lastX < 1) {
              onShimmerExit();
            }

            lastXRef.current = xValue;
          }} />
      </pattern>
      <mask id={`${chartId}-loading-mask`} maskUnits="userSpaceOnUse">
        <rect width="100%" height="100%" fill={`url(#${chartId}-loading-pattern)`} />
      </mask>
    </>
  );
};
