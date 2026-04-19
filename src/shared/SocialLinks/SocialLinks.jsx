'use client';

import s from './SocialLinks.module.scss';

const SOCIAL_CONFIG = [
  { key: 'telegram', label: 'Telegram' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'website', label: 'Сайт' },
];

export default function SocialLinks({
  socialLinks,
  title = 'Соціальні мережі',
}) {
  if (!socialLinks || typeof socialLinks !== 'object') {
    return (
      <div className={s.wrap}>
        <span className={s.title}>{title}:</span>
        <span className={s.empty}>не вказано</span>
      </div>
    );
  }

  const items = SOCIAL_CONFIG.filter(
    ({ key }) => socialLinks[key] && socialLinks[key].trim() !== ''
  );

  if (items.length === 0) {
    return (
      <div className={s.wrap}>
        <span className={s.title}>{title}:</span>
        <span className={s.empty}>не вказано</span>
      </div>
    );
  }

  return (
    <div className={s.wrap}>
      <span className={s.title}>{title}:</span>
      <ul className={s.list} aria-label={title}>
        {items.map(({ key, label }) => (
          <li key={key} className={s.item}>
            <a
              className={s.link}
              href={socialLinks[key]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
