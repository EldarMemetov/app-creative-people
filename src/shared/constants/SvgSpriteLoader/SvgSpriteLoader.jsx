'use client';
import { useEffect, useState } from 'react';

export default function SvgSpriteLoader() {
  const [sprite, setSprite] = useState('');

  useEffect(() => {
    fetch('/icons/sprite.svg')
      .then((res) => res.text())
      .then(setSprite);
  }, []);

  return (
    <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: sprite }} />
  );
}
