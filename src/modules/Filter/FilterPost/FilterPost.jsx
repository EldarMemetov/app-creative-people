'use client';

import { useState } from 'react';
import { Formik, Form } from 'formik';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import s from './FilterPost.module.scss';
import FormInput from '@/shared/FormInput/FormInput';
import FormSelect from '@/shared/FormSelect/FormSelect';
import roles from '@/utils/roles.js';

const TYPE_OPTIONS = [
  { value: 'tfp', label: 'TFP' },
  { value: 'percent', label: 'Процент' },
  { value: 'paid', label: 'Оплата' },
  { value: 'negotiable', label: 'Договірна' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Відкритий' },
  { value: 'in_progress', label: 'Команда зібрана' },
  { value: 'shooting_done', label: 'Завершений' },
];

const buildInitial = (sp) => ({
  city: sp.get('city') || '',
  country: sp.get('country') || '',
  roleNeeded: sp.get('roleNeeded') || '',
  type: sp.get('type') || '',
  status: sp.get('status') || '',
  priceMin: sp.get('priceMin') || '',
  priceMax: sp.get('priceMax') || '',
});

export default function FilterPost() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation(['roles']);

  const [open, setOpen] = useState(false);

  const ROLE_OPTIONS = roles.map((r) => ({ value: r, label: t(r) }));

  const initial = buildInitial(searchParams);
  const activeCount = Object.values(initial).filter(
    (v) => v && v !== ''
  ).length;

  const applyFilters = (values) => {
    const sp = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) sp.set(k, v);
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
            {({ resetForm }) => (
              <Form className={s.form}>
                <div className={s.row}>
                  <FormInput name="city" label="Місто" placeholder="Київ" />
                  <FormInput
                    name="country"
                    label="Країна"
                    placeholder="Україна"
                  />
                </div>

                <div className={s.row}>
                  <FormSelect
                    name="roleNeeded"
                    label="Потрібна роль"
                    placeholder="Всі ролі"
                    options={ROLE_OPTIONS}
                  />
                  <FormSelect
                    name="type"
                    label="Тип"
                    placeholder="Всі типи"
                    options={TYPE_OPTIONS}
                  />
                  <FormSelect
                    name="status"
                    label="Статус"
                    placeholder="Всі статуси"
                    options={STATUS_OPTIONS}
                  />
                </div>

                <div className={s.row}>
                  <FormInput name="priceMin" type="number" label="Ціна від" />
                  <FormInput name="priceMax" type="number" label="Ціна до" />
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
