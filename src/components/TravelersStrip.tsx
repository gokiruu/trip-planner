import React from 'react';
import { Traveler } from '../types';
import { S3Photo } from './S3Photo';

interface TravelersStripProps {
  travelers: Traveler[];
}

export const TravelersStrip: React.FC<TravelersStripProps> = ({ travelers }) => {
  if (!travelers.length) return null;
  return (
    <div className="travelers-strip">
      {travelers.map(t => (
        <div key={t.id} className="traveler-chip">
          <div className="traveler-chip-avatar">
            {t.photoKey ? (
              <S3Photo
                path={t.photoKey}
                alt={t.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              <span className="traveler-chip-initial">{t.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="traveler-chip-name">{t.name.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
};
