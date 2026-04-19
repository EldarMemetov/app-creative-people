'use client';
import { useState } from 'react';
import styles from './StarRating.module.scss';

export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 24,
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${styles.star} ${
            star <= (hover || value) ? styles.filled : styles.empty
          } ${readonly ? styles.readonly : ''}`}
          style={{ fontSize: size }}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
