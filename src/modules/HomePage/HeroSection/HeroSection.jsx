'use client';

import Container from '@/shared/container/Container';
import s from './HeroSection.module.scss';

export default function HeroSection() {
  return (
    <section className={s.hero}>
      <div className={s.bg}>
        <div className={s.bgImage} />
        <div className={s.overlay} />
        <div className={s.glowBlue} />
        <div className={s.glowViolet} />
        <div className={s.grain} />
      </div>

      <Container>
        <div className={s.inner}>
          <h1 className={s.title}>
            Твоя сцена.
            <br />
            Твоя команда.
            <br />
            <span className={s.accent}>Твоє мистецтво.</span>
          </h1>

          <p className={s.subtitle}>
            Платформа для креативних людей, де можна знаходити команду,
            показувати свої роботи, запускати проєкти, спілкуватися та бути
            частиною спільноти.
          </p>

          <div className={s.actions}>
            <button type="button" className={s.primary}>
              Реєстрація
            </button>
            <button type="button" className={s.secondary}>
              Увійти
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
