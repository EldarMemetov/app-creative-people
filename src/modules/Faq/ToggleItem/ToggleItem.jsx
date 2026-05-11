'use client';
import Icon from '@/shared/Icon/Icon';
import styles from './ToggleItem.module.scss';

export default function ToggleItem({
  index,
  title,
  description,
  isOpen,
  toggleOpen,
}) {
  return (
    <li
      className={`${styles.containerList} ${isOpen ? styles.open : ''}`}
      onClick={() => toggleOpen(index)}
    >
      <div className={styles.containerIcon}>
        <h3 className={styles.titleOpen}>{title}</h3>
        <Icon
          iconName="icon-open-faq"
          className={`${styles.icon} ${isOpen ? styles.iconRotated : ''}`}
        />
      </div>
      {isOpen && <p className={styles.descriptionOpen}>{description}</p>}
    </li>
  );
}
