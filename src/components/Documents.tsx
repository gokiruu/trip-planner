import React, { useState } from 'react';
import { DocumentItem, Trip } from '../types';
import { S3Photo } from './S3Photo';
import { uploadFile, resolveUrl } from '../utils/storage';
import { TravelersStrip } from './TravelersStrip';

interface DocumentsProps {
  trip: Trip;
  currentUserId?: string;
  onUpdateDocuments: (documents: DocumentItem[]) => void;
}

const documentTypes = [
  { value: 'flight', label: 'Flight' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'rental', label: 'Car Rental' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'visa', label: 'Visa/Passport' },
  { value: 'tickets', label: 'Event Tickets' },
  { value: 'reservation', label: 'Reservation' },
  { value: 'other', label: 'Other' },
];

const travelerName = (trip: Trip, userId?: string) => {
  if (!userId) return 'Unknown';
  const match = trip.travelers.find(t => t.id === userId);
  return match ? match.name : userId.slice(0, 8) + '…';
};

function formatRelativeTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const Documents: React.FC<DocumentsProps> = ({ trip, currentUserId, onUpdateDocuments }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDocument, setNewDocument] = useState<Partial<DocumentItem>>({ title: '', type: 'other', info: '', link: '' });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDoc, setEditDoc] = useState<Partial<DocumentItem>>({});
  const [editUploading, setEditUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setU: (v: boolean) => void,
    onKey: (k: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setU(true);
    try {
      const key = await uploadFile(file, 'documents');
      onKey(key);
    } catch {
      alert('Upload failed. Make sure Amplify Storage is deployed.');
    } finally {
      setU(false);
    }
  };

  const handleAddDocument = () => {
    if (!newDocument.title) return;
    const doc: DocumentItem = {
      id: `doc_${Date.now()}`,
      title: newDocument.title,
      type: newDocument.type || 'other',
      info: newDocument.info || undefined,
      link: newDocument.link || undefined,
      fileKey: newDocument.fileKey,
      uploadedBy: currentUserId,
      uploadedAt: new Date().toISOString(),
    };
    onUpdateDocuments([...trip.documents, doc]);
    setNewDocument({ title: '', type: 'other', info: '', link: '' });
    setShowAddForm(false);
  };

  const handleStartEdit = (doc: DocumentItem) => {
    setEditingId(doc.id);
    setEditDoc({ ...doc });
  };

  const handleSaveEdit = () => {
    onUpdateDocuments(trip.documents.map(d => d.id === editingId ? { ...d, ...editDoc } : d));
    setEditingId(null);
  };

  const handleDelete = (id: string) => onUpdateDocuments(trip.documents.filter(d => d.id !== id));

  const openLightbox = async (fileKey: string) => {
    try {
      const url = await resolveUrl(fileKey);
      setLightboxUrl(url);
    } catch { /* no-op */ }
  };

  const groupedDocuments = documentTypes.reduce((acc, type) => {
    acc[type.value] = trip.documents.filter(d => d.type === type.value);
    return acc;
  }, {} as Record<string, DocumentItem[]>);

  const DocumentForm = ({
    doc,
    setDoc,
    up,
    setUp,
    onSubmit,
    submitLabel,
    onCancel,
  }: {
    doc: Partial<DocumentItem>;
    setDoc: (d: Partial<DocumentItem>) => void;
    up: boolean;
    setUp: (v: boolean) => void;
    onSubmit: () => void;
    submitLabel: string;
    onCancel: () => void;
  }) => (
    <div className="grid gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input value={doc.title || ''} onChange={e => setDoc({ ...doc, title: e.target.value })} placeholder="Flight confirmation, Hotel booking…" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select value={doc.type || 'other'} onChange={e => setDoc({ ...doc, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          {documentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Information</label>
        <textarea value={doc.info || ''} onChange={e => setDoc({ ...doc, info: e.target.value })} rows={3} placeholder="Confirmation numbers, addresses, notes…" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
        <input type="url" value={doc.link || ''} onChange={e => setDoc({ ...doc, link: e.target.value })} placeholder="https://…" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Photo / Scan</label>
        {doc.fileKey && (
          <S3Photo path={doc.fileKey} alt="Document" style={{ maxHeight: '6rem', borderRadius: '0.5rem', marginBottom: '0.5rem', display: 'block' }} />
        )}
        <label className="upload-label">
          {up ? 'Uploading…' : doc.fileKey ? 'Change photo' : 'Upload photo / scan'}
          <input type="file" accept="image/*" onChange={e => handlePhotoUpload(e, setUp, k => setDoc({ ...doc, fileKey: k }))} style={{ display: 'none' }} disabled={up} />
        </label>
      </div>
      <div className="flex gap-3 mt-2">
        <button onClick={onSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{submitLabel}</button>
        <button onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Travelers strip */}
      {trip.travelers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>Travelers</h3>
          <TravelersStrip travelers={trip.travelers} />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Documents &amp; Info</h2>
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Document</button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Document</h3>
          <DocumentForm
            doc={newDocument}
            setDoc={setNewDocument}
            up={uploading}
            setUp={setUploading}
            onSubmit={handleAddDocument}
            submitLabel="Add Document"
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      <div className="space-y-6">
        {documentTypes.map(type => {
          const docs = groupedDocuments[type.value] || [];
          if (!docs.length) return null;
          return (
            <div key={type.value} className="bg-white rounded-lg shadow-sm border">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{type.label} <span className="text-sm font-normal text-gray-500">({docs.length})</span></h3>
              </div>
              <div className="divide-y">
                {docs.map(doc => (
                  <div key={doc.id} className="p-6">
                    {editingId === doc.id ? (
                      <div>
                        <h4 className="font-semibold mb-4">Edit Document</h4>
                        <DocumentForm
                          doc={editDoc}
                          setDoc={setEditDoc}
                          up={editUploading}
                          setUp={setEditUploading}
                          onSubmit={handleSaveEdit}
                          submitLabel="Save"
                          onCancel={() => setEditingId(null)}
                        />
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{doc.title}</h4>
                          {/* Uploader info */}
                          <p className="text-xs text-gray-400 mb-2">
                            Added by {travelerName(trip, doc.uploadedBy)} &middot; {formatRelativeTime(doc.uploadedAt)}
                          </p>
                          {doc.info && <div className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{doc.info}</div>}
                          {doc.link && (
                            <a href={doc.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mb-2 block">
                              Open Link
                              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                          {doc.fileKey && (
                            <button onClick={() => openLightbox(doc.fileKey!)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'zoom-in', display: 'block', marginTop: '0.5rem' }}>
                              <S3Photo
                                path={doc.fileKey}
                                alt={doc.title}
                                style={{ maxHeight: '8rem', borderRadius: '0.5rem', display: 'block' }}
                              />
                              <span className="text-xs text-gray-400 mt-1 block">Click to enlarge</span>
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginLeft: '1rem', flexShrink: 0 }}>
                          <button onClick={() => handleStartEdit(doc)} className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                          <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {trip.documents.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-600 mb-4">Store your flight confirmations, hotel bookings, and other important info here.</p>
          <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Add Your First Document</button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'zoom-out' }}
        >
          <img
            src={lightboxUrl}
            alt="Document enlarged"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '0.75rem', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            style={{ position: 'absolute', top: '1.25rem', right: '1.5rem', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '2.5rem', height: '2.5rem', fontSize: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
