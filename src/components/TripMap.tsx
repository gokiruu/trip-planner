import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geocode } from '../utils/geo';

L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface TripMapProps {
  query: string;
  label?: string;
  height?: string;
  zoom?: number;
}

export const TripMap: React.FC<TripMapProps> = ({ query, label, height = '260px', zoom = 12 }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'fail'>('loading');

  useEffect(() => {
    if (!query) { setStatus('fail'); return; }
    setStatus('loading');
    geocode(query).then(c => {
      setCoords(c);
      setStatus(c ? 'ok' : 'fail');
    });
  }, [query]);

  if (status === 'loading') {
    return <div className="map-placeholder">Loading map for {query}…</div>;
  }
  if (status === 'fail' || !coords) {
    return <div className="map-placeholder">Map unavailable for "{query}"</div>;
  }

  return (
    <MapContainer
      center={[coords.lat, coords.lng]}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '0.75rem', zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[coords.lat, coords.lng]}>
        <Popup>{label || query}</Popup>
      </Marker>
    </MapContainer>
  );
};
