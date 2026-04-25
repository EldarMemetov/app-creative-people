'use client';

import Container from '@/shared/container/Container';
import s from './WhyUs.module.scss';

const features = [
  {
    icon: '🌍',
    title: 'Спільнота без кордонів',
    description:
      'Єдина креативна платформа для фотографів, моделей та всієї команди — з України до Європи.',
  },
  {
    icon: '🤝',
    title: 'Прямі колаборації',
    description:
      'Ніяких агентств і посередників. Знаходь людей, домовляйся напряму і починай працювати.',
  },
  {
    icon: '🗂',
    title: 'Все в одному місці',
    description:
      'Профіль, портфоліо, пошук і спілкування — без зайвих додатків і переходів.',
  },
  {
    icon: '⚡',
    title: 'Інтерфейс, який надихає',
    description:
      'Сучасний і простий дизайн, який не заважає — а допомагає зосередитись на творчості.',
  },
  {
    icon: '🔒',
    title: 'Тільки реальні профілі',
    description:
      'Верифіковані учасники, чесні відгуки і прозора репутація кожного.',
  },
  {
    icon: '🚀',
    title: 'Зростай разом зі спільнотою',
    description:
      'Нові контакти, проєкти і можливості — щодня. Чим більше ти даєш, тим більше отримуєш.',
  },
];

export default function WhyUs() {
  return (
    <section className={s.section}>
      <Container>
        <header className={s.header}>
          <span className={s.eyebrow}>
            <span className={s.dot} />
            Чому ми
          </span>

          <h2 className={s.title}>Чому QVRIX?</h2>

          <p className={s.subtitle}>
            Ми створили простір, де творчі люди знаходять одне одного — і разом
            створюють щось більше.
          </p>
        </header>

        <ul className={s.grid}>
          {features.map((f, i) => (
            <li
              key={f.title}
              className={s.card}
              style={{ '--delay': `${0.15 + i * 0.1}s` }}
            >
              <span className={s.index}>{String(i + 1).padStart(2, '0')}</span>

              <div className={s.iconWrap}>
                <span className={s.iconOrbit} />
                <span className={s.iconGlow} />
                <span className={s.icon}>{f.icon}</span>
              </div>

              <div className={s.body}>
                <h3 className={s.cardTitle}>{f.title}</h3>
                <p className={s.cardText}>{f.description}</p>
              </div>

              <span className={s.sweep} />
              <span className={s.corner} />
              <div className={s.cardBorder} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
