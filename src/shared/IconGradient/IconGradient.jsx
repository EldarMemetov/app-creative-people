import clsx from 'clsx';
import s from './IconGradient.module.scss';

export default function IconGradient({ iconName, className, ...props }) {
  const iconClass = clsx(s.icon, className);
  return (
    <svg className={iconClass} {...props} aria-hidden="true">
      <use href={`#${iconName}`} />
    </svg>
  );
}
