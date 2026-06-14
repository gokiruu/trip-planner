import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Collaborator, Trip } from '../types';

interface TripDashboardProps {
  trip: Trip;
  currentOwnerId: string;
  onShareTrip: (collaborator: Omit<Collaborator, 'id' | 'invitedAt'>) => void;
  onRemoveCollaborator: (ownerId: string) => void;
}

export const TripDashboard: React.FC<TripDashboardProps> = ({
  trip,
  currentOwnerId,
  onShareTrip,
  onRemoveCollaborator,
}) => {
  const { tripId } = useParams();
  const [showShareForm, setShowShareForm] = useState(false);
  const [shareForm, setShareForm] = useState({ ownerId: '', name: '', email: '' });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const tripDate = new Date(date);
    const diffTime = tripDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const packedItems = trip.packing.filter(item => item.packed).length;
  const totalPackingItems = trip.packing.length;
  const daysUntil = getDaysUntil(trip.startDate);
  const collaborators = trip.collaborators.filter(collaborator => collaborator.ownerId !== currentOwnerId);

  const packingPct = totalPackingItems > 0 ? Math.round((packedItems / totalPackingItems) * 100) : 0;

  const sections = [
    {
      title: 'Itinerary',
      path: `/trip/${tripId}/itinerary`,
      description: `${trip.itinerary.length} ${trip.itinerary.length === 1 ? 'activity' : 'activities'} planned`,
      meta: 'Plan',
      accent: 'feature-card-itinerary',
    },
    {
      title: 'Expenses',
      path: `/trip/${tripId}/expenses`,
      description: `$${totalExpenses.toFixed(2)} total`,
      meta: 'Split',
      accent: 'feature-card-expenses',
    },
    {
      title: 'Packing',
      path: `/trip/${tripId}/packing`,
      description: `${packedItems} of ${totalPackingItems} items packed`,
      meta: 'Ready',
      accent: 'feature-card-packing',
      progress: packingPct,
    },
    {
      title: 'Documents',
      path: `/trip/${tripId}/documents`,
      description: `${trip.documents.length} ${trip.documents.length === 1 ? 'document' : 'documents'} saved`,
      meta: 'Store',
      accent: 'feature-card-documents',
    },
  ];

  const handleShareSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onShareTrip({
      ownerId: shareForm.ownerId,
      name: shareForm.name.trim() || undefined,
      email: shareForm.email.trim() || undefined,
    });
    setShareForm({ ownerId: '', name: '', email: '' });
    setShowShareForm(false);
  };

  return (
    <div>
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
          <div className="flex -space-x-2" style={{ flexShrink: 0, marginTop: '0.25rem' }}>
            {trip.travelers.slice(0, 4).map((traveler) => (
              <div key={traveler.id} className="avatar" title={traveler.name}>
                {traveler.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {trip.travelers.length > 4 && (
              <div className="avatar avatar-muted">+{trip.travelers.length - 4}</div>
            )}
          </div>
        </div>

        {trip.notes && (
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.5rem' }}>
            {trip.notes}
          </p>
        )}

        <div className="hero-stats">
          <div>
            <span className="hero-stat-value">
              {daysUntil > 0 ? daysUntil : daysUntil === 0 ? 0 : Math.abs(daysUntil)}
            </span>
            <span className="hero-stat-label">
              {daysUntil > 0 ? 'Days to go' : daysUntil === 0 ? 'Starts today' : 'Days ago'}
            </span>
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

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start gap-4 share-header">
          <div>
            <h2 className="text-lg font-semibold mb-2">Shared Access</h2>
            <p className="text-sm text-gray-600">
              Share your user ID with friends so they can add you to their trips. Add their user ID here to let them access this trip.
            </p>
            {currentOwnerId && (
              <p className="share-id mt-4">
                Your user ID: <span>{currentOwnerId}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => setShowShareForm(!showShareForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Share Trip
          </button>
        </div>

        {showShareForm && (
          <form onSubmit={handleShareSubmit} className="share-form mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collaborator user ID *</label>
              <input
                required
                value={shareForm.ownerId}
                onChange={(event) => setShareForm({ ...shareForm, ownerId: event.target.value })}
                placeholder="Amplify user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={shareForm.name}
                onChange={(event) => setShareForm({ ...shareForm, name: event.target.value })}
                placeholder="Travel buddy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={shareForm.email}
                onChange={(event) => setShareForm({ ...shareForm, email: event.target.value })}
                placeholder="friend@example.com"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Add Collaborator
              </button>
              <button type="button" onClick={() => setShowShareForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
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
                <button
                  type="button"
                  onClick={() => onRemoveCollaborator(collaborator.ownerId)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
