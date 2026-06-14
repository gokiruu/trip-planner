import React from 'react';
import { Link } from 'react-router-dom';
import { Trip } from '../types';

interface TripListProps {
  trips: Trip[];
}

export const TripList: React.FC<TripListProps> = ({ trips }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const getTripStatus = (startDate: string, endDate: string): 'upcoming' | 'active' | 'past' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);
    if (today < start) return 'upcoming';
    if (today > end) return 'past';
    return 'active';
  };

  const statusLabel = { upcoming: 'Upcoming', active: 'In Progress', past: 'Completed' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Trips</h1>
        <Link
          to="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No trips planned yet</p>
          <Link
            to="/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Plan Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => {
            const status = getTripStatus(trip.startDate, trip.endDate);
            return (
              <Link key={trip.id} to={`/trip/${trip.id}`} className="trip-card">
                <span className={`trip-status-badge ${status}`}>
                  {statusLabel[status]}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {trip.name}
                </h3>
                <p className="text-gray-600 mb-3">{trip.destination}</p>
                <div className="text-sm text-gray-500 mb-3">
                  {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                  <span className="ml-2">({getDuration(trip.startDate, trip.endDate)})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {trip.travelers.length} traveler{trip.travelers.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-sm text-blue-600">View details</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
