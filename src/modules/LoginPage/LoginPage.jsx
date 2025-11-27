'use client';
import s from './LoginPage.module.scss';
import { Formik, Form } from 'formik';
import { LoginSchema } from '@/shared/FormSchema/LoginSchema/LoginSchema';
import { useAuth } from '../../services/store/useAuth.js';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Container from '@/shared/container/Container';
import FormInput from '@/shared/FormInput/FormInput';
export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { t } = useTranslation(['login']);
  const GetLoginSchema = LoginSchema(t);
  return (
    <Container>
      <div className={s.section}>
        <h1>{t('login')}</h1>

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
            <Form>
              <FormInput label={t('email')} name="email" type="email" />

              <FormInput
                label={t('password')}
                name="password"
                type="password"
              />

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('loading') : t('submit')}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
}
