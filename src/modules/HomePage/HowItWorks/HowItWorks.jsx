import Container from '@/shared/container/Container';
import s from './HowItWorks.module.scss';

const steps = [
  {
    title: 'Заяви про себе',
    description:
      'Обери роль, покажи свої роботи — і нехай тебе знайдуть перші.',
  },
  {
    title: 'Знайди своїх людей',
    description:
      'Фотограф, модель, стиліст — всі тут. Один пошук — і команда готова.',
  },
  {
    title: 'Від ідеї до результату',
    description: 'Спілкуйся, домовляйся і знімай. Без зайвих кроків.',
  },
];

export default function HowItWorks() {
  return (
    <section className={s.section}>
      <Container>
        <header className={s.header}>
          <span className={s.eyebrow}>
            <span className={s.dot} />
            Процес
          </span>

          <h2 className={s.title}>
            Як це <span className={s.accent}>працює?</span>
          </h2>

          <p className={s.subtitle}>
            Три кроки — від реєстрації до першого спільного проєкту.
          </p>
        </header>

        <div className={s.timeline}>
          <div className={s.track}>
            <span className={s.trackFill} />
          </div>

          <ol className={s.list}>
            {steps.map((step, i) => (
              <li
                key={step.title}
                className={s.step}
                style={{ '--delay': `${0.2 + i * 0.25}s` }}
              >
                <div className={s.node}>
                  <span className={s.nodeRing} />
                  <span className={s.nodeCore} />
                </div>

                <div className={s.card}>
                  <span className={s.index}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className={s.body}>
                    <h3 className={s.cardTitle}>{step.title}</h3>
                    <p className={s.cardText}>{step.description}</p>
                  </div>

                  <span className={s.scan} />
                  <div className={s.cardBorder} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
