/**
 * Custom ESLint Rules for Meteo Weather App
 * Prevents critical bugs from being re-introduced
 */

module.exports = {
  rules: {
    /**
     * Prevents "Old Location" bug regression
     * Flags any assignment of "Your Location" string in geolocationService.js
     *
     * WHY: "Your Location" is for UI display only, never for API calls
     * See: docs/troubleshooting/OLD_LOCATION_BUG_FIX.md
     */
    'no-your-location-in-geolocation': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent "Your Location" string in geolocation service',
          category: 'Possible Errors',
          recommended: true,
        },
        messages: {
          yourLocationFound:
            '🚨 CRITICAL: "Your Location" found in geolocation service! ' +
            'This will cause the "Old Location" bug. ' +
            'Use coordinates instead: `${latitude}, ${longitude}`. ' +
            'See docs/troubleshooting/OLD_LOCATION_BUG_FIX.md',
        },
        schema: [],
      },
      create(context) {
        const filename = context.getFilename();

        // Only check geolocationService.js
        if (!filename.endsWith('geolocationService.js')) {
          return {};
        }

        return {
          // Check variable assignments
          AssignmentExpression(node) {
            if (node.operator === '=' && node.right.type === 'Literal') {
              const value = node.right.value;
              if (value === 'Your Location') {
                context.report({
                  node,
                  messageId: 'yourLocationFound',
                });
              }
            }

            // Check template literals too
            if (node.operator === '=' && node.right.type === 'TemplateLiteral') {
              const quasis = node.right.quasis.map((q) => q.value.cooked).join('');
              if (quasis === 'Your Location') {
                context.report({
                  node,
                  messageId: 'yourLocationFound',
                });
              }
            }
          },

          // Check ternary operators (common pattern)
          ConditionalExpression(node) {
            if (node.consequent.type === 'Literal' && node.consequent.value === 'Your Location') {
              context.report({
                node: node.consequent,
                messageId: 'yourLocationFound',
              });
            }
            if (node.alternate.type === 'Literal' && node.alternate.value === 'Your Location') {
              context.report({
                node: node.alternate,
                messageId: 'yourLocationFound',
              });
            }
          },

          // Check object properties
          Property(node) {
            if (
              node.key.name === 'address' &&
              node.value.type === 'Literal' &&
              node.value.value === 'Your Location'
            ) {
              context.report({
                node: node.value,
                messageId: 'yourLocationFound',
              });
            }
          },
        };
      },
    },
  },
};
