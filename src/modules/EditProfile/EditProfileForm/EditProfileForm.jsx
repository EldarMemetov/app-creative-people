'use client';

import { Formik, Form } from 'formik';
import { toast } from 'react-hot-toast';
import FormInput from '@/shared/FormInput/FormInput';
import { updateProfile } from '@/services/api/profileEdit/media';
import RoleSelector from '@/modules/RegisterPage/RoleSelector/RoleSelector';
import DirectionsSelector from '../DirectionsSelector/DirectionsSelector';
import s from './EditProfileForm.module.scss';

const SOCIAL_FIELDS = [
  {
    name: 'telegram',
    label: 'Telegram',
    placeholder: 'https://t.me/username',
  },
  {
    name: 'whatsapp',
    label: 'WhatsApp',
    placeholder: 'https://wa.me/49123456789',
  },
  {
    name: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
  },
  {
    name: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/username',
  },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
  },
  {
    name: 'website',
    label: 'Сайт',
    placeholder: 'https://yoursite.com',
  },
];

export default function EditProfileForm({
  user,
  ProfileSchema,
  t,
  uploadingPhoto,
  refreshUser,
}) {
  const initialFormValues = {
    name: user.name || '',
    surname: user.surname || '',
    country: user.country || '',
    city: user.city || '',
    aboutMe: user.aboutMe || '',
    experience: user.experience || '',
    roles: user.roles || [],
    directions: user.directions || [],
    socialLinks: {
      telegram: user.socialLinks?.telegram || '',
      whatsapp: user.socialLinks?.whatsapp || '',
      instagram: user.socialLinks?.instagram || '',
      facebook: user.socialLinks?.facebook || '',
      linkedin: user.socialLinks?.linkedin || '',
      website: user.socialLinks?.website || '',
    },
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialFormValues}
      validationSchema={ProfileSchema}
      onSubmit={async (values, actions) => {
        actions.setSubmitting(true);
        try {
          await updateProfile(values);
          await refreshUser();
          toast.success(t('saved'));
        } catch (err) {
          const details = err.response?.data?.details;

          if (Array.isArray(details) && details.length > 0) {
            // Пробрасываем серверные ошибки в соответствующие поля формы
            details.forEach((d) => {
              const fieldPath = Array.isArray(d.path)
                ? d.path.join('.')
                : d.path;
              if (!fieldPath) return;

              // Локализация частых случаев по roles
              if (fieldPath === 'roles' && d.type === 'array.min') {
                actions.setFieldError('roles', t('roles.choose_at_least_one'));
              } else if (fieldPath === 'roles' && d.type === 'array.max') {
                actions.setFieldError('roles', t('roles.max_three'));
              } else {
                actions.setFieldError(
                  fieldPath,
                  d.message || t('invalid_value')
                );
              }
            });
            toast.error(t('check_fields'));
          } else {
            toast.error(t('update_error'));
          }
        } finally {
          actions.setSubmitting(false);
        }
      }}
    >
      {({
        isSubmitting,
        values,
        setFieldValue,
        setFieldTouched,
        errors,
        touched,
      }) => (
        <Form className="profile-form">
          <FormInput
            label={t('name')}
            name="name"
            placeholder={t('name_placeholder')}
          />
          <FormInput
            label={t('surname')}
            name="surname"
            placeholder={t('surname_placeholder')}
          />
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
          <FormInput
            label={t('about')}
            name="aboutMe"
            placeholder={t('about_placeholder')}
            as="textarea"
          />
          <FormInput
            label={t('experience')}
            name="experience"
            placeholder={t('experience_placeholder')}
            as="textarea"
          />

          <RoleSelector
            values={values.roles}
            onChange={(newRoles) => {
              setFieldValue('roles', newRoles);
              setFieldTouched('roles', true);
            }}
            label={t('role')}
            error={touched.roles && errors.roles}
          />

          <DirectionsSelector
            values={values.directions}
            onChange={(newDirections) => {
              setFieldValue('directions', newDirections);
              setFieldTouched('directions', true);
            }}
            label={t('directions')}
            error={touched.directions && errors.directions}
          />

          {/* Соцсети */}
          <div className={s.socialSection}>
            <h3 className={s.socialTitle}>Соціальні мережі</h3>
            <div className={s.socialGrid}>
              {SOCIAL_FIELDS.map(({ name, label, placeholder }) => (
                <FormInput
                  key={name}
                  label={label}
                  name={`socialLinks.${name}`}
                  placeholder={placeholder}
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || uploadingPhoto}>
            {isSubmitting ? t('saving') : t('save')}
          </button>
        </Form>
      )}
    </Formik>
  );
}
