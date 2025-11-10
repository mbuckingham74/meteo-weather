import clsx from 'clsx';
import styles from './Button.module.css';

const Button = ({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className,
  children,
  ...rest
}) => {
  const classes = clsx(styles.button, styles[variant], styles[size], className);

  const content = (
    <>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </>
  );

  const commonProps = {
    className: clsx(classes, { [styles.fullWidth]: fullWidth }),
    ...rest,
  };

  if (Component === 'button') {
    return (
      <button type="button" {...commonProps}>
        {content}
      </button>
    );
  }

  return <Component {...commonProps}>{content}</Component>;
};

export default Button;
