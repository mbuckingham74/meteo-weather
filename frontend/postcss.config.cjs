// PostCSS configuration
// PurgeCSS removed - CSS bundle already optimized via Phase 3.1 (153.10 kB)
// Further optimization can be done via build-time tree-shaking if needed

const postcssCustomMedia = require('postcss-custom-media');
const breakpointConfig = require('./config/breakpoints.json');

const formatPx = (value) => `${value}px`;

const buildCustomMediaMap = () => {
  const customMedia = {};

  // Min-width queries (mobile-first)
  Object.entries(breakpointConfig.min).forEach(([key, value]) => {
    customMedia[`--bp-${key}`] = `(min-width: ${formatPx(value)})`;
  });

  // Max-width queries (desktop-first fallbacks)
  Object.entries(breakpointConfig.max).forEach(([key, value]) => {
    customMedia[`--bp-${key}-max`] = `(max-width: ${formatPx(value)})`;
  });

  // Helpful combinations
  customMedia['--bp-mobile-only'] = `(max-width: ${formatPx(breakpointConfig.max.md)})`;
  customMedia['--bp-tablet-only'] = `(min-width: ${formatPx(
    breakpointConfig.min.md
  )}) and (max-width: ${formatPx(breakpointConfig.max.lg)})`;
  customMedia['--bp-desktop-up'] = `(min-width: ${formatPx(breakpointConfig.min.lg)})`;

  return customMedia;
};

const customMediaMap = buildCustomMediaMap();

module.exports = {
  plugins: [
    postcssCustomMedia({
      customMedia: customMediaMap,
      preserve: false,
    }),
  ],
};
