import Container from '@/shared/container/Container';
import s from './RenderOurStory.module.scss';

export default function RenderOurStory() {
  return (
    <section className={s.story}>
      <Container>
        <div className={s.inner}>
          <span className={s.eyebrow}>
            Маніфест <span className={s.eyebrowDot}>•</span> Для тих, хто
            творить
          </span>

          <h2 className={s.title}>
            Ми самі були частиною <em>цього світу.</em>
          </h2>

          <p className={s.intro}>
            Кожен фотограф хоча б раз шукав модель через знайомих. Кожна модель
            чекала на запрошення, яке не надходило. Ми бачили, наскільки цей
            світ роздроблений — і вирішили це змінити.
          </p>

          <div className={s.declaration}>
            <p className={s.declarationLead}>Досить бігати з місця на місце.</p>
            <p className={s.declarationHero}>
              Час зібратись <em>разом.</em>
            </p>
          </div>

          <p className={s.closing}>
            Ми створили простір, де всі учасники творчого процесу існують під
            одним дахом. Зі спільною метою — знаходити одне одного і створювати
            щось більше, ніж поодинці.
          </p>

          <span className={s.endMark}>Твоя сцена починається тут.</span>
        </div>
      </Container>
    </section>
  );
}
