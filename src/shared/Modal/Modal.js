'use client';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import styles from './Modal.module.scss';
import Icon from '../Icon/Icon';

export default function Modal({
  show,
  onClose,
  children,
  className = '',
  contentClassName = '',
  onAfterClose,
}) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const onAfterCloseRef = useRef(onAfterClose);

  useEffect(() => {
    onAfterCloseRef.current = onAfterClose;
  }, [onAfterClose]);

  useEffect(() => {
    if (show) setIsMounted(true);
  }, [show]);

  useEffect(() => {
    if (!isMounted) return;

    document.body.style.overflow = show ? 'hidden' : '';
    previouslyFocused.current = document.activeElement;

    const focusTarget = panelRef.current?.querySelector(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    (focusTarget || panelRef.current)?.focus();

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
      previouslyFocused.current?.focus();
    };
  }, [isMounted, show, onClose]);

  useLayoutEffect(() => {
    if (!isMounted) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (show) {
      tl.fromTo(
        backdropRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3 }
      ).fromTo(
        panelRef.current,
        { autoAlpha: 0, y: 30, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.4 },
        '<'
      );
    } else {
      tl.to(panelRef.current, {
        autoAlpha: 0,
        y: 30,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
      })
        .to(
          backdropRef.current,
          { autoAlpha: 0, duration: 0.3, ease: 'power2.in' },
          '<'
        )
        .add(() => {
          setIsMounted(false);
          onAfterCloseRef.current?.();
        });
    }

    return () => tl.kill();
  }, [show, isMounted]);

  if (!isMounted) return null;

  return createPortal(
    <div className={`${styles.overlay} ${className}`}>
      <div ref={backdropRef} className={styles.background} onClick={onClose} />
      <div
        ref={panelRef}
        className={`${styles.modal} ${contentClassName}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          <Icon
            iconName="icon-close"
            width={12}
            height={12}
            className={styles.icon}
          />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
