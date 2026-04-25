import Container from '@/shared/container/Container';
import s from './WhoIsItForSection.module.scss';

const cards = [
  {
    title: 'Фотографи',
    description: 'Знаходь моделей та клієнтів для зйомок, розширюй клієнтуру.',
    image: '/image/card.png',
  },
  {
    title: 'Моделі',
    description: 'Отримуй запрошення на зйомки, розширюй портфоліо.',
    image: '/image/card.png',
  },
  {
    title: 'Відеографи / Режисери',
    description: 'Збирай команду для кліпів, реклами чи контенту.',
    image: '/image/card.png',
  },
  {
    title: 'Продюсери',
    description: 'Координуй проєкти, знаходь підрядників та керуй командою.',
    image: '/image/card.png',
  },
  {
    title: 'Ретушери',
    description:
      'Пропонуй свої послуги фотографам та агентствам, знаходь постійних клієнтів.',
    image: '/image/card.png',
  },
  {
    title: 'Візажисти / Стилісти / Перукарі',
    description: 'Створюй образи, працюй із командами та просувай своє ім’я.',
    image: '/image/card.png',
  },
  {
    title: 'Дизайнери одягу',
    description: 'Просувай колекції, знаходь моделей та знімальні команди.',
    image: '/image/card.png',
  },
  {
    title: 'Бізнес / Бренди / Агентства',
    description: 'Шукай креативні команди для реклами, контенту та промо.',
    image: '/image/card.png',
  },
  {
    title: 'AI-креатори',
    description:
      'Створюй фото і відео за допомогою штучного інтелекту, ділись роботами та знаходь колег.',
    image: '/image/card.png',
  },
];

export default function WhoIsItForSection() {
  return (
    <section className={s.section}>
      <div className={s.bg}>
        <div className={s.glowBlue} />
        <div className={s.glowViolet} />
        <div className={s.scanlines} />
        <div className={s.vignette} />
      </div>

      <Container>
        <header className={s.header}>
          <span className={s.eyebrow}>
            <span className={s.dot} />
            Для кого платформа
          </span>

          <h2 className={s.title}>
            Простір, де творці
            <br />
            знаходять одне одного
          </h2>

          <p className={s.subtitle}>
            Незалежно від того, хто ти — професіонал зі стажем чи лише шукаєш
            свою команду — тут є місце для тебе. Обери свою роль.
          </p>
        </header>

        <ul className={s.list}>
          {cards.map((card, i) => (
            <li
              key={card.title}
              className={s.card}
              style={{ '--delay': `${0.1 + i * 0.08}s` }}
            >
              <div className={s.frame}>
                <div
                  className={s.image}
                  style={{ backgroundImage: `url(${card.image})` }}
                />
                <div className={s.imageOverlay} />
                <div className={s.shutter} />
                <div className={s.frameBorder} />

                <span className={s.index}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className={s.tag}>
                  <span className={s.tagDot} />
                  REC
                </span>
              </div>

              <div className={s.body}>
                <h3 className={s.cardTitle}>{card.title}</h3>
                <p className={s.cardText}>{card.description}</p>
                <span className={s.line} />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
