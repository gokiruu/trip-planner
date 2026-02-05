import React, { useState } from 'react';
import { Trip, Traveler } from '../types';

interface CreateTripProps {
  onCreateTrip: (trip: Omit<Trip, 'id'>) => void;
}

export const CreateTrip: React.FC<CreateTripProps> = ({ onCreateTrip }) => {
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [travelers, setTravelers] = useState<Omit<Traveler, 'id'>[]>([
    { name: '', email: '' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const travelersWithIds: Traveler[] = travelers
      .filter(t => t.name.trim())
      .map((t, index) => ({
        id: `t${Date.now()}_${index}`,
        name: t.name.trim(),
        email: t.email?.trim() || undefined
      }));

    const newTrip: Omit<Trip, 'id'> = {
      ...formData,
      travelers: travelersWithIds,
      itinerary: [],
      expenses: [],
      packing: [],
      documents: []
    };

    onCreateTrip(newTrip);
  };

  const addTraveler = () => {
    setTravelers([...travelers, { name: '', email: '' }]);
  };

  const updateTraveler = (index: number, field: 'name' | 'email', value: string) => {
    const updated = [...travelers];
    updated[index] = { ...updated[index], [field]: value };
    setTravelers(updated);
  };

  const removeTraveler = (index: number) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Trip</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Trip Details</h2>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Weekend in Paris"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination *
              </label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paris, France"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any additional notes about the trip..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Travelers</h2>
            <button
              type="button"
              onClick={addTraveler}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Traveler
            </button>
          </div>
          
          <div className="space-y-3">
            {travelers.map((traveler, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={traveler.name}
                    onChange={(e) => updateTraveler(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={traveler.email}
                    onChange={(e) => updateTraveler(index, 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {travelers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTraveler(index)}
                    className="text-red-600 hover:text-red-700 px-2 py-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Trip
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};