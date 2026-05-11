'use client';

import { useState } from 'react';
import ToggleItem from '../ToggleItem/ToggleItem';
import styles from './ToggleList.module.scss';

export default function ToggleList({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleOpen = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <ul className={styles.containerList}>
      {items.map((item, index) => (
        <ToggleItem
          key={index}
          index={index}
          title={item.question}
          description={item.answer}
          isOpen={openIndex === index}
          toggleOpen={toggleOpen}
        />
      ))}
    </ul>
  );
}
