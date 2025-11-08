import React from 'react';
import s from './ListPrivacyPolicy.module.scss';
import ItemPrivacyPolicy from '../ItemPrivacyPolicy/ItemPrivacyPolicy';

export default function ListPrivacyPolicy({ sections = [] }) {
  if (!sections.length) {
    return <p className={s.empty}>Privacy policy unavailable.</p>;
  }

  return (
    <div className={s.list}>
      {sections.map((section, index) => (
        <div key={index} className={s.section}>
          {section.title && <h2 className={s.title}>{section.title}</h2>}
          {section.description && (
            <p className={s.description}>{section.description}</p>
          )}
          <ItemPrivacyPolicy content={section} />
        </div>
      ))}
    </div>
  );
}
