import React, { useState } from 'react';
import { PackingItem, Trip } from '../types';

interface PackingProps {
  trip: Trip;
  onUpdatePacking: (items: PackingItem[]) => void;
}

export const Packing: React.FC<PackingProps> = ({ trip, onUpdatePacking }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<PackingItem>>({
    name: '',
    quantity: 1,
    assignedToId: '',
    packed: false,
    notes: ''
  });

  const handleAddItem = () => {
    if (!newItem.name) return;

    const item: PackingItem = {
      id: `pack_${Date.now()}`,
      name: newItem.name,
      quantity: newItem.quantity || 1,
      assignedToId: newItem.assignedToId || undefined,
      packed: false,
      notes: newItem.notes || undefined
    };

    onUpdatePacking([...trip.packing, item]);
    setNewItem({ name: '', quantity: 1, assignedToId: '', packed: false, notes: '' });
    setShowAddForm(false);
  };

  const handleTogglePacked = (itemId: string) => {
    const updatedItems = trip.packing.map(item =>
      item.id === itemId ? { ...item, packed: !item.packed } : item
    );
    onUpdatePacking(updatedItems);
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdatePacking(trip.packing.filter(item => item.id !== itemId));
  };

  const getTravelerName = (id?: string) => {
    if (!id) return 'Unassigned';
    return trip.travelers.find(t => t.id === id)?.name || 'Unknown';
  };

  const getPackingStats = () => {
    const total = trip.packing.length;
    const packed = trip.packing.filter(item => item.packed).length;
    return { total, packed, percentage: total > 0 ? Math.round((packed / total) * 100) : 0 };
  };

  const stats = getPackingStats();

  const groupedItems = trip.travelers.reduce((acc, traveler) => {
    acc[traveler.id] = trip.packing.filter(item => item.assignedToId === traveler.id);
    return acc;
  }, {} as { [key: string]: PackingItem[] });

  const unassignedItems = trip.packing.filter(item => !item.assignedToId);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Packing List</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Item
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Packing Progress</h3>
          <span className="text-sm text-gray-600">
            {stats.packed} of {stats.total} items packed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{stats.percentage}% complete</p>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Packing Item</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Toothbrush, Phone charger, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
                <select
                  value={newItem.assignedToId}
                  onChange={(e) => setNewItem({ ...newItem, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {trip.travelers.map(traveler => (
                    <option key={traveler.id} value={traveler.id}>
                      {traveler.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Item
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

      {/* Packing Lists by Person */}
      <div className="space-y-6">
        {trip.travelers.map(traveler => {
          const items = groupedItems[traveler.id] || [];
          const packedCount = items.filter(item => item.packed).length;
          
          return (
            <div key={traveler.id} className="bg-white rounded-lg shadow-sm border">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {traveler.name}
                  </h3>
                  <span className="text-sm text-gray-600">
                    {packedCount}/{items.length} packed
                  </span>
                </div>
              </div>
              <div className="p-6">
                {items.length === 0 ? (
                  <p className="text-gray-500 italic">No items assigned</p>
                ) : (
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={item.packed}
                          onChange={() => handleTogglePacked(item.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`font-medium ${item.packed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {item.name}
                                {item.quantity && item.quantity > 1 && (
                                  <span className="text-gray-500 ml-1">({item.quantity})</span>
                                )}
                              </span>
                              {item.notes && (
                                <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Unassigned Items */}
        {unassignedItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Unassigned Items</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {unassignedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => handleTogglePacked(item.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`font-medium ${item.packed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.name}
                            {item.quantity && item.quantity > 1 && (
                              <span className="text-gray-500 ml-1">({item.quantity})</span>
                            )}
                          </span>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};