import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Trip } from '../types';

interface TripDashboardProps {
  trip: Trip;
}

export const TripDashboard: React.FC<TripDashboardProps> = ({ trip }) => {
  const { tripId } = useParams();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const tripDate = new Date(date);
    const diffTime = tripDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const packedItems = trip.packing.filter(item => item.packed).length;
  const totalPackingItems = trip.packing.length;

  const sections = [
    {
      title: 'Itinerary',
      icon: '📅',
      path: `/trip/${tripId}/itinerary`,
      description: `${trip.itinerary.length} activities planned`,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: 'Expenses',
      icon: '💰',
      path: `/trip/${tripId}/expenses`,
      description: `$${totalExpenses.toFixed(2)} total spent`,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      title: 'Packing',
      icon: '🎒',
      path: `/trip/${tripId}/packing`,
      description: `${packedItems}/${totalPackingItems} items packed`,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      title: 'Documents',
      icon: '📄',
      path: `/trip/${tripId}/documents`,
      description: `${trip.documents.length} documents stored`,
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ];

  const daysUntil = getDaysUntil(trip.startDate);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.name}</h1>
            <p className="text-xl text-gray-600 mb-2">{trip.destination}</p>
            <p className="text-gray-500">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </p>
          </div>
          <div className="text-right">
            {daysUntil > 0 ? (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {daysUntil} days to go
              </div>
            ) : daysUntil === 0 ? (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Today!
              </div>
            ) : (
              <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                Trip completed
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex -space-x-2">
            {trip.travelers.slice(0, 3).map((traveler, index) => (
              <div
                key={traveler.id}
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white"
                title={traveler.name}
              >
                {traveler.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {trip.travelers.length > 3 && (
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                +{trip.travelers.length - 3}
              </div>
            )}
          </div>
          <span className="text-gray-600">
            {trip.travelers.length} traveler{trip.travelers.length > 1 ? 's' : ''}
          </span>
        </div>

        {trip.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{trip.notes}</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <Link
            key={section.title}
            to={section.path}
            className={`${section.color} border rounded-lg p-6 hover:shadow-md transition-shadow`}
          >
            <div className="text-3xl mb-3">{section.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
            <p className="text-sm opacity-80">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};