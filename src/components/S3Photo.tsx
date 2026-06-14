import React, { useState, useEffect } from 'react';
import { resolveUrl } from '../utils/storage';

interface S3PhotoProps {
  path: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const S3Photo: React.FC<S3PhotoProps> = ({ path, alt, className, style }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!path) return;
    resolveUrl(path).then(setUrl).catch(() => {});
  }, [path]);

  if (!url) return null;
  return <img src={url} alt={alt || ''} className={className} style={style} />;
};
