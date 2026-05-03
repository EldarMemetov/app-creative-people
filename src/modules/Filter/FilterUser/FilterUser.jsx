'use client';

import { useState } from 'react';
import { Formik, Form } from 'formik';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import s from './FilterUser.module.scss';
import FormInput from '@/shared/FormInput/FormInput';
import FormSelect from '@/shared/FormSelect/FormSelect';
import DirectionsSelector from '@/modules/EditProfile/DirectionsSelector/DirectionsSelector';
import roles from '@/utils/roles.js';

const buildInitial = (sp) => ({
  q: sp.get('q') || '',
  city: sp.get('city') || '',
  country: sp.get('country') || '',
  role: sp.get('role') || '',
  directions: sp.getAll('directions'),
  minRating: sp.get('minRating') || '',
  maxRating: sp.get('maxRating') || '',
});

export default function FilterUser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation(['roles']);

  const [open, setOpen] = useState(false);

  const ROLE_OPTIONS = roles.map((r) => ({ value: r, label: t(r) }));

  const initial = buildInitial(searchParams);
  const activeCount = Object.entries(initial).filter(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    return v && v !== '';
  }).length;

  const applyFilters = (values) => {
    const sp = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach((x) => x && sp.append(k, x));
      } else if (v !== '' && v !== null && v !== undefined) {
        sp.set(k, typeof v === 'string' ? v.trim() : v);
      }
    });
    sp.set('page', '1');
    router.replace(`${pathname}?${sp.toString()}`);
    setOpen(false);
  };

  const resetFilters = (resetForm) => {
    resetForm({ values: buildInitial(new URLSearchParams()) });
    router.replace(pathname);
  };

  return (
    <div className={`${s.wrapper} ${open ? s.wrapperOpen : ''}`}>
      <button
        type="button"
        className={s.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={s.toggleLeft}>
          <span className={s.toggleIcon} aria-hidden>
            ⚙
          </span>
          <span className={s.toggleTitle}>Фільтри</span>
          {activeCount > 0 && <span className={s.badge}>{activeCount}</span>}
        </span>
        <span className={s.chevron} aria-hidden>
          ▾
        </span>
      </button>

      <div className={s.collapse}>
        <div className={s.collapseInner}>
          <Formik
            initialValues={initial}
            enableReinitialize
            onSubmit={applyFilters}
          >
            {({ values, setFieldValue, resetForm }) => (
              <Form className={s.form}>
                <FormInput
                  name="q"
                  label="Пошук"
                  placeholder="Ім'я або прізвище"
                />

                <div className={s.row}>
                  <FormInput name="city" label="Місто" placeholder="Київ" />
                  <FormInput
                    name="country"
                    label="Країна"
                    placeholder="Україна"
                  />
                  <FormSelect
                    name="role"
                    label="Роль"
                    placeholder="Всі ролі"
                    options={ROLE_OPTIONS}
                  />
                </div>

                <DirectionsSelector
                  label="Напрямки"
                  values={values.directions}
                  onChange={(next) => setFieldValue('directions', next)}
                />

                <div className={s.row}>
                  <FormInput
                    name="minRating"
                    type="number"
                    label="Рейтинг від"
                  />
                  <FormInput
                    name="maxRating"
                    type="number"
                    label="Рейтинг до"
                  />
                </div>

                <div className={s.actions}>
                  <button type="submit" className={s.primary}>
                    Застосувати
                  </button>
                  <button
                    type="button"
                    className={s.secondary}
                    onClick={() => resetFilters(resetForm)}
                  >
                    Скинути
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
