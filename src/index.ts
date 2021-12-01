const availableDPR = [3, 2, 1] as const;

export type SizesDPR = typeof availableDPR[number];
export type MaxDPR = Exclude<SizesDPR, 3>;

const vwRegex = /^([0-9]*)vw$/;
const pxRegex = /^([0-9]*)px$/;
const calcRegex = /^calc\((.*)\)$/;

export interface SizesParams {
  [key: string]: string;
  default: string;
}

export interface SizesOptions {
  maxDPR?: MaxDPR;
  dpiCompatibility?: boolean;
}

function scaleSizeFromDPR(dpr: SizesDPR, maxDPR: SizesDPR, value: string): string {
  const vwMatch = value.match(vwRegex);

  const ratio = maxDPR / dpr;

  if (vwMatch && vwMatch[1]) {
    return `${Math.ceil(parseInt(vwMatch[1], 10) * ratio)}vw`;
  }

  const pxMatch = value.match(pxRegex);

  if (pxMatch && pxMatch[1]) {
    return `${Math.ceil(parseInt(pxMatch[1], 10) * ratio)}px`;
  }

  const calcMatch = value.match(calcRegex);

  // Scale calc value or other things (min, max etc...)
  return `calc((${(calcMatch && calcMatch[1]) ?? value}) * ${Math.round(ratio * 100) / 100})`;
}

function getBreakpointDPRMediaQueries(
  breakpoint: string | undefined,
  value: string,
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

function getBreakpointValue(value: string, { maxDPR, dpiCompatibility }: SizesOptions, breakpoint?: string) {
  const breakPointValue = breakpoint ? `${breakpoint} ${value}` : value;

  if (maxDPR) {
    const capedDPRBreakpoints = availableDPR
      .filter(dpr => dpr > maxDPR)
      .map(dpr => getBreakpointDPRMediaQueries(breakpoint, value, dpr, maxDPR, dpiCompatibility))
      .join(', ');

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
