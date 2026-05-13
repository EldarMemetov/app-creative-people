import { getLevel, LEVELS } from '@/shared/constants/levels';
import s from './RatingBadge.module.scss';

export default function RatingBadge({ rating = 0 }) {
  const current = getLevel(rating);
  const currentIndex = LEVELS.findIndex((l) => l.name === current.name);
  const isMax = currentIndex === LEVELS.length - 1;
  const next = !isMax ? LEVELS[currentIndex + 1] : null;

  const progress = isMax
    ? 100
    : Math.round(((rating - current.min) / (current.max - current.min)) * 100);

  const pointsToNext = next ? next.min - rating : 0;

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <span className={s.level} style={{ color: current.color }}>
          {current.name}
        </span>
        <span className={s.points}>{rating} очок</span>
      </div>

      <div className={s.barWrap}>
        <div className={s.bar}>
          <div
            className={s.barFill}
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${current.color}88, ${current.color})`,
              boxShadow: `0 0 12px ${current.color}66`,
            }}
          >
            <span className={s.barShine} />
          </div>
        </div>
        <span className={s.progress}>{progress}%</span>
      </div>

      {!isMax && (
        <p className={s.hint}>
          До рівня <strong>{next.name}</strong> — ще {pointsToNext} очок
        </p>
      )}

      {isMax && <p className={s.hint}>Максимальний рівень досягнуто 🏆</p>}
    </div>
  );
}
