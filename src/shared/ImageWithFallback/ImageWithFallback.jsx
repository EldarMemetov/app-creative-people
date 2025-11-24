'use client';
import Image from 'next/image';

export function ImageWithFallback({ src, alt, ...props }) {
  return <Image {...props} src={src} alt={alt} unoptimized />;
}
