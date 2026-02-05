import React, { useState } from 'react';
import { DocumentItem, Trip } from '../types';

interface DocumentsProps {
  trip: Trip;
  onUpdateDocuments: (documents: DocumentItem[]) => void;
}

export const Documents: React.FC<DocumentsProps> = ({ trip, onUpdateDocuments }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDocument, setNewDocument] = useState<Partial<DocumentItem>>({
    title: '',
    type: 'other',
    info: '',
    link: ''
  });

  const handleAddDocument = () => {
    if (!newDocument.title) return;

    const document: DocumentItem = {
      id: `doc_${Date.now()}`,
      title: newDocument.title,
      type: newDocument.type || 'other',
      info: newDocument.info || undefined,
      link: newDocument.link || undefined
    };

    onUpdateDocuments([...trip.documents, document]);
    setNewDocument({ title: '', type: 'other', info: '', link: '' });
    setShowAddForm(false);
  };

  const handleDeleteDocument = (documentId: string) => {
    onUpdateDocuments(trip.documents.filter(doc => doc.id !== documentId));
  };

  const documentTypes = [
    { value: 'flight', label: 'Flight', icon: '✈️' },
    { value: 'hotel', label: 'Hotel', icon: '🏨' },
    { value: 'rental', label: 'Car Rental', icon: '🚗' },
    { value: 'insurance', label: 'Insurance', icon: '🛡️' },
    { value: 'visa', label: 'Visa/Passport', icon: '📘' },
    { value: 'tickets', label: 'Event Tickets', icon: '🎫' },
    { value: 'reservation', label: 'Reservation', icon: '📋' },
    { value: 'other', label: 'Other', icon: '📄' }
  ];

  const getTypeIcon = (type?: string) => {
    return documentTypes.find(t => t.value === type)?.icon || '📄';
  };

  const getTypeLabel = (type?: string) => {
    return documentTypes.find(t => t.value === type)?.label || 'Other';
  };

  const groupedDocuments = documentTypes.reduce((acc, type) => {
    acc[type.value] = trip.documents.filter(doc => doc.type === type.value);
    return acc;
  }, {} as { [key: string]: DocumentItem[] });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Documents & Info</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Document
        </button>
      </div>

      {/* Add Document Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Document</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newDocument.title}
                onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Flight confirmation, Hotel booking, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newDocument.type}
                onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Information
              </label>
              <textarea
                value={newDocument.info}
                onChange={(e) => setNewDocument({ ...newDocument, info: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Confirmation numbers, addresses, notes, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link (optional)
              </label>
              <input
                type="url"
                value={newDocument.link}
                onChange={(e) => setNewDocument({ ...newDocument, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddDocument}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Document
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

      {/* Documents by Type */}
      <div className="space-y-6">
        {documentTypes.map(type => {
          const documents = groupedDocuments[type.value] || [];
          
          if (documents.length === 0) return null;

          return (
            <div key={type.value} className="bg-white rounded-lg shadow-sm border">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">{type.icon}</span>
                  {type.label}
                  <span className="text-sm font-normal text-gray-500">
                    ({documents.length})
                  </span>
                </h3>
              </div>
              <div className="divide-y">
                {documents.map(document => (
                  <div key={document.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {document.title}
                        </h4>
                        {document.info && (
                          <div className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                            {document.info}
                          </div>
                        )}
                        {document.link && (
                          <a
                            href={document.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                          >
                            🔗 Open Link
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(document.id)}
                        className="text-red-600 hover:text-red-700 text-sm ml-4"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {trip.documents.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-600 mb-4">
            Store your flight confirmations, hotel bookings, and other important trip information here.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Add Your First Document
          </button>
        </div>
      )}
    </div>
  );
};