'use client';

import s from './RegisterPage.module.scss';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import { registerUser } from '../../services/api/auth/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../services/store/useAuth.js';
import Container from '@/shared/container/Container';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { LINKDATA } from '@/shared/constants';
import FormInput from '@/shared/FormInput/FormInput';
import { RegisterSchema } from '@/shared/FormSchema/RegisterSchema/RegisterSchema';
import RoleSelector from './RoleSelector/RoleSelector';
import CountryCitySelector from '@/shared/CountryCitySelector/CountryCitySelector';
import Icon from '@/shared/Icon/Icon';

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
                agreedToPolicy: false,
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

                  <div>
                    <CountryCitySelector />
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

                  {/* NEW: чекбокс согласия с политикой */}
                  <div className={s.policy}>
                    <label className={s.policyLabel}>
                      <Field
                        type="checkbox"
                        name="agreedToPolicy"
                        className={s.policyCheckbox}
                        data-testid="register-policy-checkbox"
                      />
                      <span className={s.policyBox} aria-hidden="true">
                        <Icon
                          iconName="icon-check"
                          className={s.policyCheck}
                          aria-hidden="true"
                        />
                      </span>
                      <span className={s.policyText}>
                        {t('agree_with')}{' '}
                        <Link
                          href={`/${LINKDATA.POLICY}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={s.policyLink}
                        >
                          {t('privacy_policy')}
                        </Link>
                      </span>
                    </label>
                    <ErrorMessage
                      name="agreedToPolicy"
                      component="p"
                      className={s.error}
                    />
                  </div>

                  <div className={s.actions}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={s.submit}
                      data-testid="register-submit-button"
                    >
                      <span className={s.submitLabel}>
                        {isSubmitting ? t('loading') : t('submit')}
                      </span>
                    </button>
                  </div>

                  <p className={s.signinHint}>
                    {t('already_have_account')}{' '}
                    <Link
                      href={LINKDATA.LOGIN}
                      className={s.signinLink}
                      data-testid="register-go-to-login"
                    >
                      {t('sign_in')}
                    </Link>
                  </p>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </Container>
    </section>
  );
}
