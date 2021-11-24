export type SizesValue = `${number}vw` | `${number}px` | `calc(${string})`;

const availableDPR = [3, 2, 1] as const;

export type SizesDPR = typeof availableDPR[number];

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

function scaleSizeFromDPR(dpr: SizesDPR, maxDPR: SizesDPR, value: SizesValue): SizesValue {
  const vwMatch = value.match(vwRegex);

  if (vwMatch && vwMatch[1]) {
    return `${Math.ceil((parseInt(vwMatch[1], 10) * maxDPR) / dpr)}vw`;
  }

  const pxMatch = value.match(pxRegex);

  if (pxMatch && pxMatch[1]) {
    return `${Math.ceil((parseInt(pxMatch[1], 10) * maxDPR) / dpr)}px`;
  }

  const calcMatch = value.match(calcRegex);

  if (calcMatch && calcMatch[1]) {
    return `calc((${calcMatch[1]}) * ${maxDPR} / ${dpr})`;
  }

  return value;
}

function getBreakpointDPRMediaQueries(
  breakpoint: string | undefined,
  value: SizesValue,
  dpr: SizesDPR,
  maxDPR: SizesDPR,
  dpiCompatibility: boolean = false,
) {
  const scaledValue = scaleSizeFromDPR(dpr, maxDPR, value);

  return [
    `(min-resolution: ${dpr}dppx)`,
    `(-webkit-min-device-pixel-ratio: ${dpr})`,
    dpiCompatibility ? `(min-resolution: ${96 * dpr}dpi)` : '',
  ]
    .filter(mediaQuery => !!mediaQuery)
    .map(mediaQuery => `${mediaQuery}${breakpoint ? ` and ${breakpoint} ` : ' '}${scaledValue}`)
    .join(', ');
}

function getBreakpointValue(value: SizesValue, { maxDPR, dpiCompatibility }: SizesOptions, breakpoint?: string) {
  const breakPointValue = breakpoint ? `${breakpoint} ${value}` : value;

  if (maxDPR) {
    const capedDPRBreakpoints = availableDPR
      .filter(dpr => dpr > maxDPR)
      .map(dpr => getBreakpointDPRMediaQueries(breakpoint, value, dpr, maxDPR, dpiCompatibility))
      .join(',');

    return capedDPRBreakpoints.length > 0 ? `${capedDPRBreakpoints}, ${breakPointValue}` : breakPointValue;
  } else {
    return breakPointValue;
  }
}

function generateSizes(params: SizesParams, options: SizesOptions = {}): string {
  const { default: receivedDefaultValue, ...breakpoints } = params;

  const breakpointsValue = Object.keys(breakpoints)
    .map(breakpoint => getBreakpointValue(breakpoints[breakpoint], options, breakpoint))
    .join(`, `);

  const defaultValue = getBreakpointValue(receivedDefaultValue, options);

  return breakpointsValue.length > 0 ? `${breakpointsValue}, ${defaultValue}` : defaultValue;
}

export default generateSizes;
