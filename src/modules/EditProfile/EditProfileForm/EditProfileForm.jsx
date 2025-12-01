'use client';

import { Formik, Form } from 'formik';
import { toast } from 'react-hot-toast';
import FormInput from '@/shared/FormInput/FormInput';
import { updateProfile } from '@/services/api/profileEdit/media';
import RoleSelector from '@/modules/RegisterPage/RoleSelector/RoleSelector';

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
    role: user.role || 'model',
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialFormValues}
      validationSchema={ProfileSchema}
      onSubmit={async (values, actions) => {
        actions.setSubmitting(true);

        try {
          const { role, ...cleanValues } = values;

          await updateProfile(cleanValues);
          await refreshUser();

          toast.success(t('saved'));
        } catch (err) {
          console.error('Update profile error:', err.response?.data || err);
          toast.error(t('update_error'));
        } finally {
          actions.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => (
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
            value={values.role}
            onChange={(role) => setFieldValue('role', role)}
          />

          <button type="submit" disabled={isSubmitting || uploadingPhoto}>
            {isSubmitting ? t('saving') : t('save')}
          </button>
        </Form>
      )}
    </Formik>
  );
}
