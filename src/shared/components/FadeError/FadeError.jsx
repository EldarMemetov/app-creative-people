import React from 'react';

const FadeError = ({ message, className }) => {
  if (!message) return null;
  return <p className={className}>{message}</p>;
};

export default FadeError;
