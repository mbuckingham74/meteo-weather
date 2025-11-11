import breakpointConfig from '../../config/breakpoints.json';

const MIN = breakpointConfig.min;
const MAX = breakpointConfig.max;

const px = (value) => `${value}px`;

export const BREAKPOINTS = {
  xs: MIN.xs,
  sm: MIN.sm,
  md: MIN.md,
  lg: MIN.lg,
  xl: MIN.xl,
  '2xl': MIN['2xl'],
};

export const BREAKPOINT_MAX = {
  xs: MAX.xs,
  sm: MAX.sm,
  md: MAX.md,
  lg: MAX.lg,
  xl: MAX.xl,
  '2xl': MAX['2xl'],
};

export const MEDIA_QUERIES = {
  up: Object.fromEntries(
    Object.entries(BREAKPOINTS).map(([key, value]) => [key, `(min-width: ${px(value)})`])
  ),
  down: Object.fromEntries(
    Object.entries(BREAKPOINT_MAX).map(([key, value]) => [key, `(max-width: ${px(value)})`])
  ),
  only: {
    mobile: `(max-width: ${px(BREAKPOINT_MAX.md)})`,
    tablet: `(min-width: ${px(BREAKPOINTS.md)}) and (max-width: ${px(BREAKPOINT_MAX.lg)})`,
    desktop: `(min-width: ${px(BREAKPOINTS.lg)})`,
  },
};

export const BREAKPOINT_SEQUENCE = ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export const getMediaQuery = (direction, key) => MEDIA_QUERIES[direction]?.[key];

export const matchBreakpoint = (key) => {
  if (typeof window === 'undefined') {
    return false;
  }

  const query = MEDIA_QUERIES.up[key];
  if (!query) {
    return false;
  }

  return window.matchMedia(query).matches;
};
