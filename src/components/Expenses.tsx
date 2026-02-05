import React, { useState } from 'react';
import { Expense, Trip } from '../types';

interface ExpensesProps {
  trip: Trip;
  onUpdateExpenses: (expenses: Expense[]) => void;
}

export const Expenses: React.FC<ExpensesProps> = ({ trip, onUpdateExpenses }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    payerId: trip.travelers[0]?.id || '',
    participantIds: trip.travelers.map(t => t.id),
    category: 'other'
  });

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.payerId) return;

    const splitAmount = newExpense.amount / newExpense.participantIds!.length;
    const expense: Expense = {
      id: `exp_${Date.now()}`,
      description: newExpense.description,
      amount: newExpense.amount,
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      payerId: newExpense.payerId,
      participantIds: newExpense.participantIds || [],
      splits: newExpense.participantIds!.map(id => ({
        travelerId: id,
        amount: splitAmount
      })),
      category: newExpense.category || 'other'
    };

    onUpdateExpenses([...trip.expenses, expense]);
    setNewExpense({
      description: '',
      amount: 0,
      payerId: trip.travelers[0]?.id || '',
      participantIds: trip.travelers.map(t => t.id),
      category: 'other'
    });
    setShowAddForm(false);
  };

  const handleDeleteExpense = (expenseId: string) => {
    onUpdateExpenses(trip.expenses.filter(exp => exp.id !== expenseId));
  };

  const getTravelerName = (id: string) => {
    return trip.travelers.find(t => t.id === id)?.name || 'Unknown';
  };

  const calculateBalances = () => {
    const balances: { [travelerId: string]: number } = {};
    
    // Initialize balances
    trip.travelers.forEach(traveler => {
      balances[traveler.id] = 0;
    });

    // Calculate what each person paid vs what they owe
    trip.expenses.forEach(expense => {
      // Add what they paid
      balances[expense.payerId] += expense.amount;
      
      // Subtract what they owe
      expense.splits?.forEach(split => {
        balances[split.travelerId] -= split.amount;
      });
    });

    return balances;
  };

  const balances = calculateBalances();
  const totalExpenses = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const categories = [
    { value: 'accommodation', label: 'Accommodation', icon: '🏨' },
    { value: 'food', label: 'Food & Drinks', icon: '🍽️' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'activities', label: 'Activities', icon: '🎯' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'other', label: 'Other', icon: '💳' }
  ];

  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.value === category)?.icon || '💳';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Expenses</h3>
          <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Per Person</h3>
          <p className="text-2xl font-bold text-gray-900">
            ${trip.travelers.length > 0 ? (totalExpenses / trip.travelers.length).toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Transactions</h3>
          <p className="text-2xl font-bold text-gray-900">{trip.expenses.length}</p>
        </div>
      </div>

      {/* Balances */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Balances</h3>
        <div className="space-y-2">
          {trip.travelers.map(traveler => {
            const balance = balances[traveler.id];
            return (
              <div key={traveler.id} className="flex justify-between items-center">
                <span className="font-medium">{traveler.name}</span>
                <span className={`font-semibold ${
                  balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {balance > 0 ? '+' : ''}${balance.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dinner at restaurant"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
              <select
                value={newExpense.payerId}
                onChange={(e) => setNewExpense({ ...newExpense, payerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {trip.travelers.map(traveler => (
                  <option key={traveler.id} value={traveler.id}>
                    {traveler.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Split between</label>
              <div className="space-y-2">
                {trip.travelers.map(traveler => (
                  <label key={traveler.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newExpense.participantIds?.includes(traveler.id)}
                      onChange={(e) => {
                        const participantIds = newExpense.participantIds || [];
                        if (e.target.checked) {
                          setNewExpense({
                            ...newExpense,
                            participantIds: [...participantIds, traveler.id]
                          });
                        } else {
                          setNewExpense({
                            ...newExpense,
                            participantIds: participantIds.filter(id => id !== traveler.id)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    {traveler.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddExpense}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Expense
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

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">All Expenses</h3>
        </div>
        <div className="divide-y">
          {trip.expenses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No expenses recorded yet
            </div>
          ) : (
            trip.expenses.map(expense => (
              <div key={expense.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getCategoryIcon(expense.category || 'other')}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{expense.description}</h4>
                      <p className="text-sm text-gray-600">
                        Paid by {getTravelerName(expense.payerId)} • {expense.date}
                      </p>
                      <p className="text-sm text-gray-600">
                        Split between: {expense.participantIds.map(id => getTravelerName(id)).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-700 text-sm mt-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};