export const HERO_LIMITS = {
  showreel: {
    count: 1,
    accept: 'video/*',
    kind: 'video',
    label: 'Шоурил (1 видео)',
  },
  slideshow: {
    count: 5,
    accept: 'image/*',
    kind: 'photo',
    label: 'Слайдшоу (до 5 фото)',
  },
  cover: {
    count: 1,
    accept: 'image/*',
    kind: 'photo',
    label: 'Баннер (1 фото)',
  },
};

export const MAX_IMAGE_BYTES =
  Number(process.env.NEXT_PUBLIC_MAX_IMAGE_BYTES) || 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES =
  Number(process.env.NEXT_PUBLIC_MAX_VIDEO_BYTES) || 100 * 1024 * 1024;

export const ERROR_MESSAGES = {
  hero_mode_not_set: 'Сначала выберите режим портфолио',
  too_many_files: 'Превышен лимит файлов для этого режима',
  wrong_file_type: 'Этот тип файла не подходит для выбранного режима',
  image_too_large: 'Фото больше 5 МБ',
  video_too_large: 'Видео больше 100 МБ',
  unsupported_type: 'Неподдерживаемый формат файла',
  no_files: 'Файлы не выбраны',
  invalid_hero_type: 'Некорректный режим',
  user_not_found: 'Пользователь не найден',
  item_not_found: 'Элемент не найден',
  processing_error: 'Ошибка обработки файла',
};
