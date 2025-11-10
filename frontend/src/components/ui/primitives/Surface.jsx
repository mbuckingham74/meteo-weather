import { forwardRef } from 'react';
import styles from './primitives.module.css';
import { resolveRadius, resolveShadow, resolveSpacing } from './tokenMaps';

const Surface = forwardRef(
  (
    {
      as: Component = 'div',
      padding = 'md',
      radius = 'lg',
      elevation = 'md',
      background,
      border,
      className = '',
      style,
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [styles.surface, className].filter(Boolean).join(' ');
    const inlineStyle = {
      ...style,
      '--surface-padding': resolveSpacing(padding, 'var(--card-padding)'),
      '--surface-radius': resolveRadius(radius, 'var(--radius-lg)'),
      '--surface-shadow': resolveShadow(elevation, 'var(--shadow-md)'),
    };

    if (background) {
      inlineStyle['--surface-bg'] = background;
    }

    if (border) {
      inlineStyle['--surface-border'] = border === 'none' ? 'transparent' : border;
    }

    return (
      <Component ref={ref} className={classes} style={inlineStyle} {...rest}>
        {children}
      </Component>
    );
  }
);

Surface.displayName = 'Surface';

export default Surface;
