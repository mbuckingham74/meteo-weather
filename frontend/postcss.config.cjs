const { purgeCSSPlugin } = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    // Only run PurgeCSS in production builds
    ...(process.env.NODE_ENV === 'production'
      ? [
          purgeCSSPlugin({
            // Content files to scan for used CSS classes
            content: [
              './src/**/*.{js,jsx,ts,tsx}',
              './index.html',
              './public/index.html',
            ],

            // CSS files to purge
            css: ['./src/**/*.css'],

            // Safelist: Classes that should NEVER be removed
            safelist: {
              // Standard safelist (exact matches)
              standard: [
                // Root and HTML elements
                'html',
                'body',
                '#root',

                // Theme classes (dynamically toggled)
                /^theme-/,
                'light-theme',
                'dark-theme',
                'forest-theme',

                // Density classes (dynamically toggled)
                /^density-/,
                'density-comfortable',
                'density-compact',

                // Screen reader only
                'sr-only',
              ],

              // Deep safelist (includes all descendants)
              deep: [
                // ITCSS Objects (layout patterns with .o- prefix)
                /^o-/,

                // ITCSS Utilities (helper classes with .u- prefix)
                /^u-/,

                // Leaflet map styles (third-party)
                /^leaflet-/,

                // Recharts (third-party chart library)
                /^recharts-/,

                // Material Design classes
                /^md3-/,
                /^m3-/,

                // Toast notifications (if we add them in future)
                /^toast-/,
                /^notification-/,

                // Modal and dialog classes (dynamically rendered)
                /^modal-/,
                /^dialog-/,

                // Animation classes (dynamically added)
                /^animate-/,
                /^fade-/,
                /^slide-/,

                // Loading and skeleton states
                /^loading-/,
                /^skeleton-/,

                // Weather-specific dynamic classes
                /^weather-/,
                /^alert-/,
                /^forecast-/,

                // Admin panel classes
                /^admin-/,

                // Error states
                /^error-/,

                // Focus visible (accessibility)
                /^focus-visible/,

                // Reduced motion
                /^reduced-motion/,
              ],

              // Greedy safelist (more aggressive pattern matching)
              greedy: [
                // React classes (dynamically generated)
                /^__react/,

                // Vite HMR classes (dev mode)
                /^__vite/,

                // CSS Module hashes (generated at build time)
                /_[a-zA-Z0-9]{5}$/,

                // Data attributes used for styling
                /^\[data-/,

                // ARIA attributes used for styling
                /^\[aria-/,

                // State pseudo-classes
                /:hover$/,
                /:focus$/,
                /:active$/,
                /:disabled$/,
                /:checked$/,

                // Responsive breakpoint classes (dynamically applied)
                /@media/,
              ],
            },

            // Default extractor (extracts class names from content)
            defaultExtractor: (content) => {
              // Match all possible class names and CSS identifiers
              const matches = content.match(/[A-Za-z0-9-_:/]+/g) || [];

              // Also extract from className prop in JSX
              const classNameMatches =
                content.match(/className\s*=\s*["']([^"']+)["']/g) || [];
              const classNames = classNameMatches
                .map((match) => match.match(/["']([^"']+)["']/)?.[1])
                .filter(Boolean)
                .flatMap((className) => className.split(/\s+/));

              return [...matches, ...classNames];
            },

            // Variables: Keep all CSS custom properties
            variables: true,

            // Keyframes: Keep all @keyframes animations
            keyframes: true,

            // Fontface: Keep all @font-face declarations
            fontFace: true,

            // Rejected: Log removed selectors for debugging
            rejected: process.env.PURGECSS_DEBUG === 'true',
          }),
        ]
      : []),
  ],
};
