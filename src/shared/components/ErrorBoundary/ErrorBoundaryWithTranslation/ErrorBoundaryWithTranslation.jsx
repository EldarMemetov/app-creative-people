'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from '../ErrorBoundary';

const ErrorBoundaryWithTranslation = (props) => {
  const { t } = useTranslation('errorGlobal');
  return <ErrorBoundary {...props} t={t} />;
};

export default ErrorBoundaryWithTranslation;
