import clsx from 'clsx';
import s from './Button.module.scss';

const Button = ({
  children,
  type = 'button',
  variant = 'variant1',
  className,
  spanClassName,
  onClick,
  as = 'button',
  ...props
}) => {
  const Component = as;

  return (
    <Component
      type={as === 'button' ? type : undefined}
      className={clsx(s.button, s[variant], className)}
      onClick={onClick}
      {...props}
    >
      <span className={spanClassName}>{children}</span>
    </Component>
  );
};

export default Button;
