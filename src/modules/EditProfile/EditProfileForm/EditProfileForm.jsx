'use client';

import { Formik, Form } from 'formik';
import { toast } from 'react-hot-toast';
import FormInput from '@/shared/FormInput/FormInput';
import { updateProfile } from '@/services/api/profileEdit/media';
import RoleSelector from '@/modules/RegisterPage/RoleSelector/RoleSelector';
import DirectionsSelector from '../DirectionsSelector/DirectionsSelector';
import s from './EditProfileForm.module.scss';
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
          const serverError = err.response?.data;
          if (serverError?.details) {
            const rolesError = serverError.details.find((d) =>
              d.path.includes('roles')
            );
            if (rolesError) {
              if (rolesError.type === 'array.min') {
                actions.setFieldError('roles', t('roles.choose_at_least_one'));
              } else if (rolesError.type === 'array.max') {
                actions.setFieldError('roles', t('roles.max_three'));
              }
            }
          } else {
            toast.error(t('update_error'));
          }
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
            values={values.roles}
            onChange={(newRoles) => setFieldValue('roles', newRoles)}
          />
          <DirectionsSelector
            values={values.directions}
            onChange={(newDirections) =>
              setFieldValue('directions', newDirections)
            }
            label={t('directions')}
          />

          <button type="submit" disabled={isSubmitting || uploadingPhoto}>
            {isSubmitting ? t('saving') : t('save')}
          </button>
        </Form>
      )}
    </Formik>
  );
}
