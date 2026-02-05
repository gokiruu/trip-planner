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
      year: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Trips</h1>
        <Link
          to="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No trips yet</p>
          <Link
            to="/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              to={`/trip/${trip.id}`}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {trip.name}
              </h3>
              <p className="text-gray-600 mb-3">{trip.destination}</p>
              <div className="text-sm text-gray-500 mb-3">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                <span className="ml-2">({getDuration(trip.startDate, trip.endDate)})</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {trip.travelers.length} traveler{trip.travelers.length > 1 ? 's' : ''}
                </div>
                <div className="text-sm text-blue-600">
                  View Details →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};