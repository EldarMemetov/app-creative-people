// postFormSchema.js
import * as Yup from 'yup';
import roles from '@/utils/roles';

const berlinTodayDateOnly = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
};

export const postFormSchema = Yup.object()
  .shape({
    title: Yup.string().min(3).max(100).required('Обязательное поле'),
    description: Yup.string().min(10).max(2000).required('Обязательное поле'),
    country: Yup.string().min(2).max(100).required('Обязательное поле'),
    city: Yup.string().min(2).max(50).required('Обязательное поле'),

    hasNoDate: Yup.boolean().optional(),

    date: Yup.date()
      .nullable()
      .optional()
      .when('hasNoDate', (hasNoDate, schema) => {
        if (hasNoDate) return schema.nullable().optional();
        return schema
          .required('Укажите дату')
          .test(
            'not-in-past-berlin',
            'Дата не может быть в прошлом',
            function (value) {
              if (!value) return false;
              const parsed = new Date(value);
              if (Number.isNaN(parsed.getTime())) return false;
              const berlinTodayStr = berlinTodayDateOnly();
              const berlinToday = new Date(berlinTodayStr);
              const parsedDateOnly = new Date(
                parsed.toISOString().slice(0, 10)
              );
              return parsedDateOnly >= berlinToday;
            }
          );
      }),

    type: Yup.string()
      .oneOf(['tfp', 'paid', 'percent', 'negotiable'])
      .required(),

    price: Yup.number()
      .min(0)
      .when('type', (type, schema) =>
        type === 'paid'
          ? schema.min(1, 'Цена должна быть больше 0').required('Укажите цену')
          : schema.optional()
      ),

    percent: Yup.number()
      .min(0)
      .when('type', (type, schema) =>
        type === 'percent'
          ? schema
              .min(1, 'Процент должен быть от 1 до 100')
              .max(100, 'Процент должен быть от 1 до 100')
              .required('Укажите процент')
          : schema.optional()
      ),

    roleSlots: Yup.array()
      .of(
        Yup.object().shape({
          role: Yup.string().oneOf(roles).required(),
          required: Yup.number().min(1).required(),
        })
      )
      .optional(),

    roleSlotsText: Yup.string().optional(),

    maxAssigned: Yup.number().min(1).optional(),
  })
  .test('roles-required', 'Выберите хотя бы одну роль', function (value) {
    if (!value) return false;
    const { roleSlots, roleSlotsText } = value;

    if (Array.isArray(roleSlots) && roleSlots.length > 0) return true;

    if (roleSlotsText && roleSlotsText.trim()) {
      try {
        const parsed = JSON.parse(roleSlotsText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasValid = parsed.some(
            (r) =>
              r &&
              typeof r === 'object' &&
              typeof r.role === 'string' &&
              roles.includes(r.role) &&
              (Number(r.required) || 1) > 0
          );
          if (hasValid) return true;
        }
      } catch (e) {
        return false;
      }
    }

    return false;
  });
