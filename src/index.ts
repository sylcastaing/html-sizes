export type SizesValue = `${number}vw` | `${number}px` | `calc(${string})`;

const availableDPR = [1, 2, 3] as const;

type SizesDPR = typeof availableDPR[number];

const vwRegex = /^([0-9]*)vw$/;
const pxRegex = /^([0-9]*)px$/;
const calcRegex = /^calc\((.*)\)$/;

export interface SizesParams {
  [key: string]: SizesValue;
  default: SizesValue;
}

export interface SizesOptions {
  maxDPR?: SizesDPR;
  dpiCompatibility?: boolean;
}

function rewriteSizeFromDPR(
  dpr: SizesDPR,
  maxDPR: SizesDPR,
  value: SizesValue
): SizesValue {
  const vwMatch = value.match(vwRegex);

  const scaleValue = (matchedValue: string, unit: 'vw' | 'px'): SizesValue => {
    const scaledValue = parseInt(matchedValue, 10);

    return isNaN(scaledValue)
      ? value
      : `${Math.ceil((scaledValue * maxDPR) / dpr)}${unit}`;
  };

  if (vwMatch && vwMatch[1]) {
    return scaleValue(vwMatch[1], 'vw');
  }

  const pxMatch = value.match(pxRegex);

  if (pxMatch && pxMatch[1]) {
    return scaleValue(pxMatch[1], 'px');
  }

  const calcMatch = value.match(calcRegex);

  if (calcMatch && calcMatch[1]) {
    return `calc((${calcMatch[1]}) * ${maxDPR} / ${dpr})`;
  }

  return value;
}

function getBreakpointDPRMediaQueries(
  breakpoint: string,
  value: SizesValue,
  dpr: SizesDPR,
  maxDPR: SizesDPR,
  dpiCompatibility: boolean = false
) {
  const rewriteValue = rewriteSizeFromDPR(dpr, maxDPR, value);

  const mediaQueries = [
    `(min-resolution: ${dpr}dppx) and ${breakpoint} ${rewriteValue}`,
    `(-webkit-min-device-pixel-ratio: ${dpr}) and ${breakpoint} ${rewriteValue}`,
  ];

  if (dpiCompatibility) {
    return [
      ...mediaQueries,
      `(min-resolution: ${96 * dpr}dpi) and ${breakpoint} ${rewriteValue}`,
    ].join(', ');
  } else {
    return mediaQueries.join(', ');
  }
}

function getBreakpointValue(
  breakpoint: string,
  value: SizesValue,
  { maxDPR, dpiCompatibility }: SizesOptions
) {
  const breakPointValue = `${breakpoint} ${value}`;

  if (maxDPR) {
    const capedDPRBreakpoints = availableDPR
      .filter((dpr) => dpr > maxDPR)
      .map((dpr) =>
        getBreakpointDPRMediaQueries(
          breakpoint,
          value,
          dpr,
          maxDPR,
          dpiCompatibility
        )
      )
      .join(',');

    return capedDPRBreakpoints.length > 0
      ? `${capedDPRBreakpoints}, ${breakPointValue}`
      : breakPointValue;
  } else {
    return breakPointValue;
  }
}

function getDefaultValueDPRMediaQueries(
  value: SizesValue,
  dpr: SizesDPR,
  maxDPR: SizesDPR,
  dpiCompatibility: boolean = false
) {
  const rewriteValue = rewriteSizeFromDPR(dpr, maxDPR, value);

  const mediaQueries = [
    `(min-resolution: ${dpr}dppx) ${rewriteValue}`,
    `(-webkit-min-device-pixel-ratio: ${dpr})  ${rewriteValue}`,
  ];

  if (dpiCompatibility) {
    return [
      ...mediaQueries,
      `(min-resolution: ${96 * dpr}dpi) ${rewriteValue}`,
    ].join(', ');
  } else {
    return mediaQueries.join(', ');
  }
}

function getDefaultValue(
  value: SizesValue,
  { maxDPR, dpiCompatibility }: SizesOptions
) {
  if (maxDPR) {
    const capedDPRBreakpoints = availableDPR
      .filter((dpr) => dpr > maxDPR)
      .map((dpr) =>
        getDefaultValueDPRMediaQueries(value, dpr, maxDPR, dpiCompatibility)
      )
      .join(',');

    return capedDPRBreakpoints.length > 0
      ? `${capedDPRBreakpoints}, ${value}`
      : value;
  } else {
    return value;
  }
}

function generateSizes(
  params: SizesParams,
  options: SizesOptions = {}
): string {
  const { default: receivedDefaultValue, ...breakpoints } = params;

  const breakpointsValue = Object.keys(breakpoints).reduce(
    (acc, breakpoint, index) => {
      return `${index === 0 ? acc : `${acc}, `}${getBreakpointValue(
        breakpoint,
        breakpoints[breakpoint],
        options
      )}`;
    },
    ''
  );

  const defaultValue = getDefaultValue(receivedDefaultValue, options);

  return breakpointsValue.length > 0
    ? `${breakpointsValue}, ${defaultValue}`
    : defaultValue;
}

export default generateSizes;
