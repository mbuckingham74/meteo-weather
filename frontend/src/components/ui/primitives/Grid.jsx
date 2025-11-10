import { forwardRef } from 'react';
import styles from './primitives.module.css';
import { resolveSpacing } from './tokenMaps';

const breakpointKeys = ['base', 'sm', 'md', 'lg', 'xl'];

const normalizeColumns = (columns) => {
  if (typeof columns === 'number') {
    return { base: columns };
  }

  if (columns && typeof columns === 'object') {
    return columns;
  }

  return { base: 1 };
};

const formatSize = (value) => {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return value;
};

const Grid = forwardRef(
  (
    {
      as: Component = 'div',
      columns = { base: 1 },
      gap = 'md',
      align = 'stretch',
      justify = 'stretch',
      autoFit = false,
      minWidth = '16rem',
      className = '',
      style,
      children,
      ...rest
    },
    ref
  ) => {
    const normalizedColumns = normalizeColumns(columns);
    if (!normalizedColumns.base) {
      normalizedColumns.base = 1;
    }

    const inlineStyle = {
      ...style,
      '--grid-gap': resolveSpacing(gap),
      '--grid-align': align,
      '--grid-justify': justify,
    };

    breakpointKeys.forEach((key) => {
      const value = normalizedColumns[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        inlineStyle[`--grid-cols-${key === 'base' ? 'base' : key}`] = value;
      }
    });

    if (autoFit) {
      inlineStyle['--grid-min-width'] = formatSize(minWidth);
    }

    const classes = [styles.grid, className].filter(Boolean).join(' ');

    return (
      <Component
        ref={ref}
        className={classes}
        data-auto-fit={autoFit || undefined}
        style={inlineStyle}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

Grid.displayName = 'Grid';

export default Grid;
