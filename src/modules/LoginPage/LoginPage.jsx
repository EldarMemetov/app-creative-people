'use client';
import s from './LoginPage.module.scss';
import { Formik, Form } from 'formik';
import { LoginSchema } from '@/shared/FormSchema/LoginSchema/LoginSchema';
import { useAuth } from '../../services/store/useAuth.js';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Container from '@/shared/container/Container';
import FormInput from '@/shared/FormInput/FormInput';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
import { ROUTES, LINKDATA } from '@/shared/constants';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { t } = useTranslation(['login']);
  const GetLoginSchema = LoginSchema(t);

  return (
    <section className={s.page}>
      <div className={s.bg}>
        <div className={s.glowBlue} />
        <div className={s.glowViolet} />
        <div className={s.grid} />
      </div>

      <Container>
        <div className={s.inner}>
          <div className={s.card}>
            <h1 className={s.title}>{t('login')}</h1>
            <p className={s.subtitle}>{t('login_hint') || ''}</p>

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={GetLoginSchema}
              onSubmit={async (values, actions) => {
                actions.setSubmitting(true);
                try {
                  await auth.login(values.email, values.password);
                  toast.success(t('login_success'));
                  router.push('/profile');
                } catch (err) {
                  if (err.status === 401) {
                    actions.setFieldError('email', t('login_failed'));
                    actions.setFieldError('password', t('login_failed'));
                  } else {
                    toast.error(err.message || t('login_failed'));
                  }
                } finally {
                  actions.setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className={s.form}>
                  <div className={s.field}>
                    <FormInput label={t('email')} name="email" type="email" />
                  </div>

                  <div className={s.field}>
                    <FormInput
                      label={t('password')}
                      name="password"
                      type="password"
                    />
                  </div>

                  <div className={s.actions}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={s.submit}
                      data-testid="login-submit-button"
                    >
                      <span className={s.submitLabel}>
                        {isSubmitting ? t('loading') : t('submit')}
                      </span>
                    </button>
                  </div>
                </Form>
              )}
            </Formik>

            <div className={s.footer}>
              <LinkButton
                path={ROUTES.FORGOT}
                type={LINKDATA.FORGOT}
                className={s.forgotLink}
              >
                {t('back_password')}
              </LinkButton>
            </div>

            <p className={s.signupHint}>
              {t('no_account')}{' '}
              <Link
                href={LINKDATA.REGISTER}
                className={s.signupLink}
                data-testid="login-go-to-register"
              >
                {t('sign_up')}
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
