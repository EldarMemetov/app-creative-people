import Container from '@/shared/container/Container';
import s from './WhereWeAreGoing.module.scss';

export default function WhereWeAreGoing() {
  return (
    <section className={s.vision}>
      <Container>
        <div className={s.inner}>
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} aria-hidden="true" />
            Місія і візія
          </span>

          <h2 className={s.title}>
            Ми віримо, що талант є скрізь.
            <br />
            Йому просто потрібна <em>сцена.</em>
          </h2>

          <div className={s.body}>
            <p className={s.paragraph}>
              Зробити творчу колаборацію доступною для кожного — незалежно від
              міста, досвіду чи бюджету. Ми будуємо простір, де починаючий
              фотограф з маленького міста має ті самі можливості, що і
              досвідчений професіонал з великого.
            </p>

            <p className={s.paragraph}>
              QVRIX — це не просто каталог профілів. Це жива спільнота, де
              народжуються проєкти, будуються карєри і зявляються нові імена.
              Наша ціль — стати головною креативною платформою України та
              Європи, де кожен творчий професіонал має свій голос, своє
              портфоліо і свою аудиторію.
            </p>
          </div>

          <p className={s.spotlight}>
            <span className={s.spotlightLead}>Від першої зйомки</span>
            <span className={s.spotlightHero}>до великого імені</span>
            <span className={s.spotlightOutro}>
              — ми будемо поруч на кожному кроці.
            </span>
          </p>
        </div>
      </Container>
    </section>
  );
}
