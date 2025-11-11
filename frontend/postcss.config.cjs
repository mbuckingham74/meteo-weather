// PostCSS configuration
// Note: PurgeCSS has been temporarily disabled due to module loading issues
// TODO: Re-enable PurgeCSS once module resolution is fixed

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
    // PurgeCSS temporarily disabled - uncomment when fixed
    // See frontend/package.json devDependencies for @fullhuman/postcss-purgecss
  ],
};
