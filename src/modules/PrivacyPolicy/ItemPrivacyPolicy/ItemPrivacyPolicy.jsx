import React from 'react';
import s from './ItemPrivacyPolicy.module.scss';

export default function ItemPrivacyPolicy({ content }) {
  if (!content) return null;

  if (content.points) {
    return (
      <ul className={s.list}>
        {content.points.map((point, idx) => (
          <li key={idx} className={s.point}>
            {point}
          </li>
        ))}
      </ul>
    );
  }

  if (content.subsections) {
    return (
      <div className={s.subsections}>
        {content.subsections.map((sub, idx) => (
          <div key={idx} className={s.subsection}>
            {sub.title && <h3 className={s.subtitle}>{sub.title}</h3>}
            <ItemPrivacyPolicy content={sub} />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
