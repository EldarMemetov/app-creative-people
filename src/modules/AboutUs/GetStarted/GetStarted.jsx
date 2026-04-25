import Container from '@/shared/container/Container';
import s from './GetStarted.module.scss';

export default function GetStarted() {
  return (
    <section className={s.cta}>
      <Container>
        <div className={s.inner}>
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} aria-hidden="true" />
            Ранній доступ
          </span>

          <h2 className={s.title}>Твоє місце вже тут.</h2>

          <p className={s.subtitle}>
            Найкращий час щоб почати — був вчора. Другий найкращий — прямо
            зараз.
          </p>

          <div className={s.actions}>
            <button type="button" className={s.primary}>
              Зареєструватись
            </button>
            <button type="button" className={s.secondary}>
              На головну
            </button>
          </div>

          <span className={s.note}>
            <span className={s.noteDot} /> 247 креаторів приєднались цього тижня
          </span>
        </div>
      </Container>
    </section>
  );
}
