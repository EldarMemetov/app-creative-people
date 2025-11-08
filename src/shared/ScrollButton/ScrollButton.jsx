'use client';

import Button from '../components/button/Button';
import { ScrollToId } from '../scrollToId/scrollToId';

export default function ScrollButton({
  targetId,
  children,
  onClick,
  ...props
}) {
  const handleClick = (e) => {
    if (onClick) onClick(e);
    onClick;
    ScrollToId(targetId);
  };

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
}
