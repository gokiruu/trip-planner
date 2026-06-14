import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Collaborator, Traveler, Trip } from '../types';
import { TripMap } from './TripMap';
import { S3Photo } from './S3Photo';
import { uploadFile } from '../utils/storage';

interface TripDashboardProps {
  trip: Trip;
  currentOwnerId: string;
  onShareTrip: (collaborator: Omit<Collaborator, 'id' | 'invitedAt'>) => void;
  onRemoveCollaborator: (ownerId: string) => void;
  onDeleteTrip: () => void;
  onUpdateTravelers: (travelers: Traveler[]) => void;
  onSendInvite?: (email: string) => Promise<void>;
}

export const TripDashboard: React.FC<TripDashboardProps> = ({
  trip,
  currentOwnerId,
  onShareTrip,
  onRemoveCollaborator,
  onDeleteTrip,
  onUpdateTravelers,
  onSendInvite,
}) => {
  const { tripId } = useParams();
  const [showShareForm, setShowShareForm] = useState(false);
  const [shareForm, setShareForm] = useState({ ownerId: '', name: '', email: '' });
  const [showTravelerForm, setShowTravelerForm] = useState(false);
  const [newTraveler, setNewTraveler] = useState({ name: '', email: '' });
  const [newTravelerPhotoKey, setNewTravelerPhotoKey] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  const parseLocalDate = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

  const formatDate = (date: string) =>
    parseLocalDate(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const tripDate = parseLocalDate(date);
    return Math.ceil((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const packedItems = trip.packing.filter(item => item.packed).length;
  const totalPackingItems = trip.packing.length;
  const daysUntil = getDaysUntil(trip.startDate);
  const collaborators = trip.collaborators.filter(c => c.ownerId !== currentOwnerId);
  const packingPct = totalPackingItems > 0 ? Math.round((packedItems / totalPackingItems) * 100) : 0;

  const sections = [
    { title: 'Itinerary', path: `/trip/${tripId}/itinerary`, description: `${trip.itinerary.length} ${trip.itinerary.length === 1 ? 'activity' : 'activities'} planned`, meta: 'Plan', accent: 'feature-card-itinerary' },
    { title: 'Expenses', path: `/trip/${tripId}/expenses`, description: `$${totalExpenses.toFixed(2)} total`, meta: 'Split', accent: 'feature-card-expenses' },
    { title: 'Packing', path: `/trip/${tripId}/packing`, description: `${packedItems} of ${totalPackingItems} items packed`, meta: 'Ready', accent: 'feature-card-packing', progress: packingPct },
    { title: 'Documents', path: `/trip/${tripId}/documents`, description: `${trip.documents.length} ${trip.documents.length === 1 ? 'document' : 'documents'} saved`, meta: 'Store', accent: 'feature-card-documents' },
  ];

  const handleTravelerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const key = await uploadFile(file, 'travelers');
      setNewTravelerPhotoKey(key);
    } catch {
      alert('Photo upload failed.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddTraveler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraveler.name.trim()) return;
    const traveler: Traveler = {
      id: `t${Date.now()}`,
      name: newTraveler.name.trim(),
      email: newTraveler.email.trim() || undefined,
      photoKey: newTravelerPhotoKey || undefined,
    };
    onUpdateTravelers([...trip.travelers, traveler]);

    if (newTraveler.email.trim() && onSendInvite) {
      setSendingInvite(true);
      try {
        await onSendInvite(newTraveler.email.trim());
      } catch {
        // fail silently — invite is best-effort
      } finally {
        setSendingInvite(false);
      }
    }

    setNewTraveler({ name: '', email: '' });
    setNewTravelerPhotoKey('');
    setShowTravelerForm(false);
  };

  const handleRemoveTraveler = (id: string) => onUpdateTravelers(trip.travelers.filter(t => t.id !== id));

  const handleShareSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onShareTrip({ ownerId: shareForm.ownerId, name: shareForm.name.trim() || undefined, email: shareForm.email.trim() || undefined });
    setShareForm({ ownerId: '', name: '', email: '' });
    setShowShareForm(false);
  };

  return (
    <div>
      {/* Hero */}
      <div className="trip-hero mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="eyebrow">Trip overview</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{trip.name}</h1>
            <p className="text-xl text-gray-600 mb-1">{trip.destination}</p>
            <p className="text-gray-500" style={{ fontSize: '0.9rem' }}>
              {formatDate(trip.startDate)} &mdash; {formatDate(trip.endDate)}
            </p>
          </div>
          <button
            onClick={() => { if (window.confirm('Delete this trip? This cannot be undone.')) onDeleteTrip(); }}
            style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.35rem 0.85rem', fontSize: '0.8rem', cursor: 'pointer', flexShrink: 0 }}
          >
            Delete trip
          </button>
        </div>

        {trip.notes && (
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.5rem' }}>
            {trip.notes}
          </p>
        )}

        <div className="hero-stats">
          <div>
            <span className="hero-stat-value">{daysUntil > 0 ? daysUntil : daysUntil === 0 ? 0 : Math.abs(daysUntil)}</span>
            <span className="hero-stat-label">{daysUntil > 0 ? 'Days to go' : daysUntil === 0 ? 'Starts today' : 'Days ago'}</span>
          </div>
          <div>
            <span className="hero-stat-value">{trip.travelers.length}</span>
            <span className="hero-stat-label">Travelers</span>
          </div>
          <div>
            <span className="hero-stat-value">${totalExpenses.toFixed(0)}</span>
            <span className="hero-stat-label">Spent</span>
          </div>
          <div>
            <span className="hero-stat-value">{packingPct}%</span>
            <span className="hero-stat-label">Packed</span>
          </div>
        </div>
      </div>

      {/* Destination Map */}
      <div className="bg-white rounded-lg shadow-sm border mb-6" style={{ overflow: 'hidden' }}>
        <div className="px-5 py-3 border-b" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>📍</span>
          <h2 className="text-lg font-semibold">{trip.destination}</h2>
        </div>
        <TripMap query={trip.destination} label={trip.destination} height="280px" />
      </div>

      {/* Travelers */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Who's going</h2>
          <button onClick={() => setShowTravelerForm(!showTravelerForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Add Traveler
          </button>
        </div>

        {showTravelerForm && (
          <form onSubmit={handleAddTraveler} className="share-form mb-5">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input required value={newTraveler.name} onChange={e => setNewTraveler({ ...newTraveler, name: e.target.value })} placeholder="Alex" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email {onSendInvite ? '(sends invite)' : ''}</label>
                <input type="email" value={newTraveler.email} onChange={e => setNewTraveler({ ...newTraveler, email: e.target.value })} placeholder="alex@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile photo</label>
              {newTravelerPhotoKey && (
                <S3Photo path={newTravelerPhotoKey} alt="Preview" style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem', display: 'block' }} />
              )}
              <label className="upload-label">
                {uploadingPhoto ? 'Uploading…' : newTravelerPhotoKey ? 'Change photo' : 'Upload photo'}
                <input type="file" accept="image/*" onChange={handleTravelerPhotoUpload} style={{ display: 'none' }} disabled={uploadingPhoto} />
              </label>
            </div>
            <div className="flex gap-3 mt-3">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" disabled={sendingInvite}>
                {sendingInvite ? 'Sending invite…' : 'Add'}
              </button>
              <button type="button" onClick={() => { setShowTravelerForm(false); setNewTravelerPhotoKey(''); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        )}

        {trip.travelers.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No travelers added yet.</p>
        ) : (
          <div className="traveler-cards-grid">
            {trip.travelers.map(traveler => (
              <div key={traveler.id} className="traveler-card">
                <div className="traveler-card-avatar">
                  {traveler.photoKey ? (
                    <S3Photo
                      path={traveler.photoKey}
                      alt={traveler.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <span className="traveler-card-initial">{traveler.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <p className="traveler-card-name">{traveler.name}</p>
                {traveler.email && <p className="traveler-card-email">{traveler.email}</p>}
                <button onClick={() => handleRemoveTraveler(traveler.id)} className="traveler-card-remove">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Access */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start gap-4 share-header">
          <div>
            <h2 className="text-lg font-semibold mb-2">Shared Access</h2>
            <p className="text-sm text-gray-600">
              Share your user ID with friends so they can add you to their trips. Add their user ID here to let them access this trip.
            </p>
            {currentOwnerId && <p className="share-id mt-4">Your user ID: <span>{currentOwnerId}</span></p>}
          </div>
          <button onClick={() => setShowShareForm(!showShareForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Share Trip
          </button>
        </div>

        {showShareForm && (
          <form onSubmit={handleShareSubmit} className="share-form mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collaborator user ID *</label>
              <input required value={shareForm.ownerId} onChange={e => setShareForm({ ...shareForm, ownerId: e.target.value })} placeholder="Amplify user ID" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={shareForm.name} onChange={e => setShareForm({ ...shareForm, name: e.target.value })} placeholder="Travel buddy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={shareForm.email} onChange={e => setShareForm({ ...shareForm, email: e.target.value })} placeholder="friend@example.com" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Collaborator</button>
              <button type="button" onClick={() => setShowShareForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        )}

        {collaborators.length > 0 && (
          <div className="collaborator-list mt-4">
            {collaborators.map(collaborator => (
              <div key={collaborator.ownerId} className="collaborator-row">
                <div>
                  <p className="font-medium text-gray-900">{collaborator.name || collaborator.email || 'Collaborator'}</p>
                  <p className="text-sm text-gray-500">{collaborator.ownerId}</p>
                </div>
                <button type="button" onClick={() => onRemoveCollaborator(collaborator.ownerId)} className="text-red-600 hover:text-red-700 text-sm">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <Link key={section.title} to={section.path} className={`feature-card ${section.accent}`}>
            <div className="feature-kicker">{section.meta}</div>
            <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
            <p className="text-sm opacity-80">{section.description}</p>
            {section.progress !== undefined && (
              <div className="packing-bar-track">
                <div className="packing-bar-fill" style={{ width: `${section.progress}%` }} />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};
