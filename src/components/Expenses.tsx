import React, { useState } from 'react';
import { Expense, Trip } from '../types';
import { S3Photo } from './S3Photo';
import { uploadFile } from '../utils/storage';

interface ExpensesProps {
  trip: Trip;
  onUpdateExpenses: (expenses: Expense[]) => void;
}

const CATEGORIES = [
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'food', label: 'Food & Drinks' },
  { value: 'transport', label: 'Transport' },
  { value: 'activities', label: 'Activities' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
];

const getCategoryLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || 'Other';

interface FormState {
  description: string;
  amount: number | undefined;
  category: string;
  payerId: string;
  participantIds: string[];
  photoKey?: string;
}

const emptyForm = (trip: Trip): FormState => ({
  description: '',
  amount: undefined,
  category: 'other',
  payerId: trip.travelers[0]?.id || '',
  participantIds: trip.travelers.map(t => t.id),
});

export const Expenses: React.FC<ExpensesProps> = ({ trip, onUpdateExpenses }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExp, setNewExp] = useState<FormState>(emptyForm(trip));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editExp, setEditExp] = useState<FormState>(emptyForm(trip));
  const [uploadingAdd, setUploadingAdd] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  const getTravelerName = (id: string) => trip.travelers.find(t => t.id === id)?.name || 'Unknown';

  const buildSplits = (amount: number, participantIds: string[]) =>
    participantIds.map(id => ({ travelerId: id, amount: amount / participantIds.length }));

  const handleAdd = () => {
    if (!newExp.description || !newExp.amount || !newExp.payerId || !newExp.participantIds.length) return;
    const expense: Expense = {
      id: `exp_${Date.now()}`,
      description: newExp.description,
      amount: newExp.amount,
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      payerId: newExp.payerId,
      participantIds: newExp.participantIds,
      splits: buildSplits(newExp.amount, newExp.participantIds),
      category: newExp.category,
      photoKey: newExp.photoKey,
    };
    onUpdateExpenses([...trip.expenses, expense]);
    setNewExp(emptyForm(trip));
    setShowAddForm(false);
  };

  const handleStartEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditExp({
      description: expense.description,
      amount: expense.amount,
      category: expense.category || 'other',
      payerId: expense.payerId,
      participantIds: expense.participantIds,
      photoKey: expense.photoKey,
    });
  };

  const handleSaveEdit = () => {
    if (!editExp.description || !editExp.amount || !editExp.payerId || !editExp.participantIds.length) return;
    onUpdateExpenses(trip.expenses.map(e =>
      e.id === editingId
        ? {
            ...e,
            description: editExp.description,
            amount: editExp.amount!,
            category: editExp.category,
            payerId: editExp.payerId,
            participantIds: editExp.participantIds,
            splits: buildSplits(editExp.amount!, editExp.participantIds),
            photoKey: editExp.photoKey,
          }
        : e
    ));
    setEditingId(null);
  };

  const handleDelete = (id: string) => onUpdateExpenses(trip.expenses.filter(e => e.id !== id));

  const uploadPhoto = async (
    file: File,
    setUploading: (v: boolean) => void,
    setForm: React.Dispatch<React.SetStateAction<FormState>>
  ) => {
    setUploading(true);
    try {
      const key = await uploadFile(file, 'expenses');
      setForm(prev => ({ ...prev, photoKey: key }));
    } catch {
      alert('Photo upload failed. Make sure Amplify Storage is deployed.');
    } finally {
      setUploading(false);
    }
  };

  const calculateBalances = () => {
    const b: Record<string, number> = {};
    trip.travelers.forEach(t => { b[t.id] = 0; });
    trip.expenses.forEach(e => {
      b[e.payerId] = (b[e.payerId] || 0) + e.amount;
      e.splits?.forEach(s => { b[s.travelerId] = (b[s.travelerId] || 0) - s.amount; });
    });
    return b;
  };

  const balances = calculateBalances();
  const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

  const ExpenseFields = ({
    form,
    setForm,
    uploading,
    onUploadPhoto,
  }: {
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    uploading: boolean;
    onUploadPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="grid gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <input
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Dinner, hotel night, taxi..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount ?? ''}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value === '' ? undefined : parseFloat(e.target.value) }))}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
        <select
          value={form.payerId}
          onChange={e => setForm(f => ({ ...f, payerId: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {trip.travelers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Split between</label>
        <div className="space-y-2">
          {trip.travelers.map(t => (
            <label key={t.id} className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={form.participantIds.includes(t.id)}
                onChange={e => setForm(f => ({
                  ...f,
                  participantIds: e.target.checked
                    ? [...f.participantIds, t.id]
                    : f.participantIds.filter(id => id !== t.id),
                }))}
              />
              {t.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Receipt photo</label>
        {form.photoKey && (
          <S3Photo
            path={form.photoKey}
            alt="Receipt"
            style={{ maxHeight: '5rem', borderRadius: '0.5rem', marginBottom: '0.5rem', display: 'block' }}
          />
        )}
        <label className="upload-label">
          {uploading ? 'Uploading...' : form.photoKey ? 'Change photo' : 'Upload receipt'}
          <input type="file" accept="image/*" onChange={onUploadPhoto} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Expense
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total</h3>
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
      {trip.travelers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Balances</h3>
          <div className="space-y-2">
            {trip.travelers.map(traveler => {
              const balance = balances[traveler.id] || 0;
              return (
                <div key={traveler.id} className="flex justify-between items-center">
                  <span className="font-medium">{traveler.name}</span>
                  <span className={`font-semibold ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {balance > 0 ? '+' : ''}${balance.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Expense</h3>
          <ExpenseFields
            form={newExp}
            setForm={setNewExp}
            uploading={uploadingAdd}
            onUploadPhoto={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f, setUploadingAdd, setNewExp); }}
          />
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Expense</button>
            <button onClick={() => setShowAddForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">All Expenses</h3>
        </div>
        <div className="divide-y">
          {trip.expenses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No expenses recorded yet.</div>
          ) : (
            trip.expenses.map(expense => (
              <div key={expense.id} className="p-6">
                {editingId === expense.id ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Edit Expense</h4>
                    <ExpenseFields
                      form={editExp}
                      setForm={setEditExp}
                      uploading={uploadingEdit}
                      onUploadPhoto={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f, setUploadingEdit, setEditExp); }}
                    />
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleSaveEdit} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Save</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="type-badge">{getCategoryLabel(expense.category || 'other')}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{expense.description}</h4>
                        <p className="text-sm text-gray-600">Paid by {getTravelerName(expense.payerId)} · {expense.date}</p>
                        <p className="text-sm text-gray-600">Split: {expense.participantIds.map(id => getTravelerName(id)).join(', ')}</p>
                        {expense.photoKey && (
                          <S3Photo
                            path={expense.photoKey}
                            alt="Receipt"
                            style={{ maxHeight: '6rem', borderRadius: '0.5rem', marginTop: '0.5rem', display: 'block' }}
                          />
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                      <p className="text-lg font-semibold text-gray-900 mb-1">${expense.amount.toFixed(2)}</p>
                      <button onClick={() => handleStartEdit(expense)} className="text-blue-600 hover:text-blue-700 text-sm block mb-1">Edit</button>
                      <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-700 text-sm block">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
