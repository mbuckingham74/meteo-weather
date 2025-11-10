const spacingScale = {
  none: '0px',
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
};

const radiusScale = {
  none: '0px',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
};

const shadowScale = {
  none: 'none',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
};

export const resolveSpacing = (value, fallback = 'var(--spacing-md)') => {
  if (value == null) {
    return fallback;
  }

  if (typeof value === 'number') {
    return `${value}px`;
  }

  if (spacingScale[value]) {
    return spacingScale[value];
  }

  return value || fallback;
};

export const resolveRadius = (value, fallback = 'var(--radius-md)') => {
  if (value == null) {
    return fallback;
  }

  if (typeof value === 'number') {
    return `${value}px`;
  }

  if (radiusScale[value]) {
    return radiusScale[value];
  }

  return value || fallback;
};

export const resolveShadow = (value, fallback = 'var(--shadow-md)') => {
  if (value == null) {
    return fallback;
  }

  if (shadowScale[value]) {
    return shadowScale[value];
  }

  return value || fallback;
};
