'use client';
import s from './EmojiButton.module.scss';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useFormikContext } from 'formik';
import React, { useState, useRef, useEffect } from 'react';

export default function EmojiButton({ fieldName }) {
  const { values, setFieldValue } = useFormikContext();
  const [showPicker, setShowPicker] = useState(false);
  const wrapperRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    const char = emoji?.native || emoji?.colons || '';
    setFieldValue(fieldName, (values[fieldName] || '') + char);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={s.emojiWrapper}>
      <button
        type="button"
        className={s.emojiBtn}
        onClick={() => setShowPicker((p) => !p)}
        aria-label="Toggle emoji picker"
      >
        😎
      </button>

      {showPicker && (
        <div className={s.picker} role="dialog" aria-label="Emoji picker">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            previewPosition="none"
            emojiSize={24}
            theme="light"
          />
        </div>
      )}
    </div>
  );
}
