import React, { useState } from 'react';
import { ItineraryItem, Trip } from '../types';

interface ItineraryProps {
  trip: Trip;
  onUpdateItinerary: (items: ItineraryItem[]) => void;
}

export const Itinerary: React.FC<ItineraryProps> = ({ trip, onUpdateItinerary }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ItineraryItem>>({
    day: 1,
    title: '',
    type: 'activity',
    startTime: '',
    location: '',
    notes: ''
  });

  const getTripDays = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        number: days.length + 1,
        date: new Date(d).toISOString().split('T')[0],
        label: new Date(d).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return days;
  };

  const days = getTripDays();

  const getItemsForDay = (dayNumber: number) => {
    return trip.itinerary
      .filter(item => item.day === dayNumber)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  };

  const handleAddItem = () => {
    if (!newItem.title) return;

    const item: ItineraryItem = {
      id: `it_${Date.now()}`,
      day: newItem.day || 1,
      title: newItem.title,
      type: newItem.type || 'activity',
      startTime: newItem.startTime || undefined,
      location: newItem.location || undefined,
      notes: newItem.notes || undefined
    };

    onUpdateItinerary([...trip.itinerary, item]);
    setNewItem({ day: 1, title: '', type: 'activity', startTime: '', location: '', notes: '' });
    setShowAddForm(false);
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdateItinerary(trip.itinerary.filter(item => item.id !== itemId));
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'hotel': return '🏨';
      case 'transport': return '🚗';
      case 'activity': 
      default: return '🎯';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Itinerary</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Activity
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Activity</h3>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={newItem.day}
                  onChange={(e) => setNewItem({ ...newItem, day: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {days.map(day => (
                    <option key={day.number} value={day.number}>
                      Day {day.number} - {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activity">Activity</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="hotel">Hotel</option>
                  <option value="transport">Transport</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Activity name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={newItem.startTime}
                  onChange={(e) => setNewItem({ ...newItem, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Address or venue"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Activity
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {days.map(day => {
          const dayItems = getItemsForDay(day.number);
          return (
            <div key={day.number} className="bg-white rounded-lg shadow-sm border">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Day {day.number} - {day.label}
                </h3>
              </div>
              <div className="p-6">
                {dayItems.length === 0 ? (
                  <p className="text-gray-500 italic">No activities planned for this day</p>
                ) : (
                  <div className="space-y-4">
                    {dayItems.map(item => (
                      <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl">{getTypeIcon(item.type)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                          {item.startTime && (
                            <p className="text-sm text-gray-600 mt-1">⏰ {item.startTime}</p>
                          )}
                          {item.location && (
                            <p className="text-sm text-gray-600 mt-1">📍 {item.location}</p>
                          )}
                          {item.notes && (
                            <p className="text-sm text-gray-700 mt-2">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};