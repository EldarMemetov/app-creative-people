'use client';

import s from './RegisterPage.module.scss';
import { Formik, Form, ErrorMessage } from 'formik';
import { registerUser } from '../../services/api/auth/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../services/store/useAuth.js';
import Container from '@/shared/container/Container';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import FormInput from '@/shared/FormInput/FormInput';
import { RegisterSchema } from '@/shared/FormSchema/RegisterSchema/RegisterSchema';
import RoleSelector from './RoleSelector/RoleSelector';

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const { t } = useTranslation(['register']);
  const GetRegisterSchema = RegisterSchema(t);

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
            <h1 className={s.title}>{t('register')}</h1>
            <p className={s.subtitle}>{t('register_hint') || ''}</p>

            <Formik
              initialValues={{
                name: '',
                surname: '',
                country: '',
                city: '',
                email: '',
                password: '',
                roles: [],
              }}
              validationSchema={GetRegisterSchema}
              onSubmit={async (values, actions) => {
                actions.setSubmitting(true);
                try {
                  await registerUser(values);
                  await auth.login(values.email, values.password);
                  toast.success(t('register_success'));
                  router.push('/profile');
                } catch (err) {
                  if (err.status === 409) {
                    actions.setFieldError('email', t('email_already_exist'));
                  } else {
                    toast.error(err.message || t('register_failed'));
                  }
                } finally {
                  actions.setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form className={s.form}>
                  <div className={s.row}>
                    <div className={s.field}>
                      <FormInput label={t('name')} name="name" />
                    </div>
                    <div className={s.field}>
                      <FormInput label={t('surname')} name="surname" />
                    </div>
                  </div>

                  <div className={s.row}>
                    <div className={s.field}>
                      <FormInput
                        label={t('country')}
                        name="country"
                        placeholder={t('country_placeholder')}
                      />
                    </div>
                    <div className={s.field}>
                      <FormInput
                        label={t('city')}
                        name="city"
                        placeholder={t('city_placeholder')}
                      />
                    </div>
                  </div>

                  <div className={s.field}>
                    <FormInput label={t('email')} name="email" type="email" />
                  </div>

                  <div className={s.field}>
                    <FormInput
                      label={t('password')}
                      name="password"
                      type="password"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className={s.roles}>
                    <RoleSelector
                      values={values.roles}
                      onChange={(roles) => setFieldValue('roles', roles)}
                    />
                    <ErrorMessage
                      name="role"
                      component="p"
                      className={s.error}
                    />
                  </div>

                  <div className={s.actions}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={s.submit}
                    >
                      <span className={s.submitLabel}>
                        {isSubmitting ? t('loading') : t('submit')}
                      </span>
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </Container>
    </section>
  );
}
