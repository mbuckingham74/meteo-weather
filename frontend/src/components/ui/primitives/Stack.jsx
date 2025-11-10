import { forwardRef } from 'react';
import styles from './primitives.module.css';
import { resolveSpacing } from './tokenMaps';

const Stack = forwardRef(
  (
    {
      as: Component = 'div',
      gap = 'md',
      direction = 'column',
      align = 'stretch',
      justify = 'flex-start',
      wrap = false,
      className = '',
      style,
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [styles.stack, className].filter(Boolean).join(' ');
    const inlineStyle = {
      ...style,
      '--stack-gap': resolveSpacing(gap),
      '--stack-direction': direction,
      '--stack-align': align,
      '--stack-justify': justify,
      '--stack-wrap': typeof wrap === 'boolean' ? (wrap ? 'wrap' : 'nowrap') : wrap,
    };

    return (
      <Component ref={ref} className={classes} style={inlineStyle} {...rest}>
        {children}
      </Component>
    );
  }
);

Stack.displayName = 'Stack';

export default Stack;
