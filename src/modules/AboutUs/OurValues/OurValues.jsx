import Container from '@/shared/container/Container';
import s from './OurValues.module.scss';

const VALUES = [
  {
    num: '01',
    title: 'Відкритість',
    text: "Ми будуємо простір без бар'єрів — для початківців і профі, для малих брендів і великих агентств.",
  },
  {
    num: '02',
    title: 'Простота',
    text: 'Жодних зайвих кроків. Реєстрація, профіль, пошук — і ти вже в спільноті.',
  },
  {
    num: '03',
    title: 'Творчість',
    text: 'Ми надихаємо — інтерфейсом, спільнотою і можливостями, які відкриває платформа.',
  },
  {
    num: '04',
    title: 'Довіра',
    text: 'Реальні люди, реальні роботи, реальні відгуки. Ніяких фейків і посередників.',
  },
  {
    num: '05',
    title: 'Спільнота',
    text: 'Ми не сервіс — ми спільнота. Кожен учасник робить платформу кращою.',
  },
];

export default function OurValues() {
  return (
    <section className={s.values}>
      <Container>
        <div className={s.head}>
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} aria-hidden="true" />
            Принципи
          </span>
          <h2 className={s.title}>
            Що для нас <em>важливо.</em>
          </h2>
        </div>

        <ul className={s.grid}>
          {VALUES.map((v, i) => (
            <li
              key={v.num}
              className={`${s.card} ${i < 2 ? s.cardWide : s.cardNarrow}`}
            >
              <span className={s.cardNum}>{v.num}</span>
              <h3 className={s.cardTitle}>{v.title}</h3>
              <p className={s.cardText}>{v.text}</p>
              <span className={s.cardCorner} aria-hidden="true" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
