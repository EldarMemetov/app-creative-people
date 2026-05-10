import Container from '@/shared/container/Container';
import s from './GetStarted.module.scss';
import { ROUTES, LINKDATA } from '@/shared/constants';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
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
            <LinkButton
              className={s.primary}
              path={ROUTES.REGISTER}
              type={LINKDATA.TYPE_LIGHT_BORDER}
              linkText=" Реєстрація"
            />
            <LinkButton
              className={s.secondary}
              path={ROUTES.LOGIN}
              type={LINKDATA.TYPE_LIGHT_BORDER}
              linkText="Увійти"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
