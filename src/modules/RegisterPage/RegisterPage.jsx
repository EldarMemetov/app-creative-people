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
    <Container>
      <div className={s.section}>
        <h1>{t('register')}</h1>

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
            <Form>
              <FormInput label={t('name')} name="name" />
              <FormInput label={t('surname')} name="surname" />
              <FormInput
                label={t('country')}
                name="country"
                placeholder={t('country_placeholder')}
              />
              <FormInput
                label={t('city')}
                name="city"
                placeholder={t('city_placeholder')}
              />
              <FormInput label={t('email')} name="email" type="email" />
              <FormInput
                label={t('password')}
                name="password"
                type="password"
                autoComplete="current-password"
              />

              <RoleSelector
                values={values.roles}
                onChange={(roles) => setFieldValue('roles', roles)}
              />
              <ErrorMessage name="role" component="p" className={s.error} />

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
