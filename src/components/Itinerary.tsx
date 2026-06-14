import React, { useState } from 'react';
import { ItineraryItem, Proposal, Trip } from '../types';

interface ItineraryProps {
  trip: Trip;
  currentUserId: string;
  onUpdateItinerary: (items: ItineraryItem[]) => void;
  onUpdateProposals: (proposals: Proposal[]) => void;
}

export const Itinerary: React.FC<ItineraryProps> = ({
  trip,
  currentUserId,
  onUpdateItinerary,
  onUpdateProposals,
}) => {
  const parseLocalDate = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

  // ── Itinerary state ──────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ItineraryItem>>({
    day: 1, title: '', type: 'activity', startTime: '', location: '', notes: '', link: '', photoUrl: '',
  });

  // ── Proposal state ───────────────────────────────────────────
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: '', description: '', link: '' });

  const getTripDays = () => {
    const start = parseLocalDate(trip.startDate);
    const end = parseLocalDate(trip.endDate);
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        number: days.length + 1,
        date: new Date(d).toISOString().split('T')[0],
        label: new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    return days;
  };

  const days = getTripDays();

  const getItemsForDay = (dayNumber: number) =>
    trip.itinerary
      .filter(item => item.day === dayNumber)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const handleAddItem = () => {
    if (!newItem.title) return;
    const item: ItineraryItem = {
      id: `it_${Date.now()}`,
      day: newItem.day || 1,
      title: newItem.title,
      type: newItem.type || 'activity',
      startTime: newItem.startTime || undefined,
      location: newItem.location || undefined,
      notes: newItem.notes || undefined,
      link: newItem.link || undefined,
      photoUrl: newItem.photoUrl || undefined,
    };
    onUpdateItinerary([...trip.itinerary, item]);
    setNewItem({ day: 1, title: '', type: 'activity', startTime: '', location: '', notes: '', link: '', photoUrl: '' });
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => onUpdateItinerary(trip.itinerary.filter(i => i.id !== id));

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'restaurant': return 'Food';
      case 'hotel': return 'Stay';
      case 'transport': return 'Transit';
      default: return 'Activity';
    }
  };

  // ── Proposal helpers ─────────────────────────────────────────
  const proposals = trip.proposals || [];

  const getSentiment = (votes: Record<string, 'yes' | 'no' | 'maybe'>) => {
    const vals = Object.values(votes);
    if (!vals.length) return 'none';
    const yes = vals.filter(v => v === 'yes').length;
    const no = vals.filter(v => v === 'no').length;
    if (yes / vals.length > 0.5) return 'yes';
    if (no / vals.length > 0.5) return 'no';
    return 'mixed';
  };

  const handleAddProposal = () => {
    if (!newProposal.title.trim()) return;
    const proposal: Proposal = {
      id: `prop_${Date.now()}`,
      title: newProposal.title.trim(),
      description: newProposal.description.trim() || undefined,
      link: newProposal.link.trim() || undefined,
      proposedByUserId: currentUserId,
      votes: {},
      createdAt: new Date().toISOString(),
    };
    onUpdateProposals([...proposals, proposal]);
    setNewProposal({ title: '', description: '', link: '' });
    setShowProposalForm(false);
  };

  const handleVote = (proposalId: string, vote: 'yes' | 'no' | 'maybe') => {
    const updated = proposals.map(p => {
      if (p.id !== proposalId) return p;
      const votes = { ...p.votes };
      if (votes[currentUserId] === vote) {
        delete votes[currentUserId]; // toggle off
      } else {
        votes[currentUserId] = vote;
      }
      return { ...p, votes };
    });
    onUpdateProposals(updated);
  };

  const handleDeleteProposal = (id: string) => onUpdateProposals(proposals.filter(p => p.id !== id));

  const handleAddToItinerary = (proposal: Proposal) => {
    const item: ItineraryItem = {
      id: `it_${Date.now()}`,
      day: 1,
      title: proposal.title,
      type: 'activity',
      notes: proposal.description,
      link: proposal.link,
    };
    onUpdateItinerary([...trip.itinerary, item]);
    handleDeleteProposal(proposal.id);
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Itinerary</h2>
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Activity
        </button>
      </div>

      {/* ── Add Activity Form ── */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Activity</h3>
          <div className="grid gap-4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={newItem.day}
                  onChange={e => setNewItem({ ...newItem, day: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {days.map(day => (
                    <option key={day.number} value={day.number}>Day {day.number} — {day.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newItem.type}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
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
                value={newItem.title}
                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Activity name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input type="time" value={newItem.startTime} onChange={e => setNewItem({ ...newItem, startTime: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} placeholder="Address or venue" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} rows={2} placeholder="Additional notes..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
              <input type="url" value={newItem.link} onChange={e => setNewItem({ ...newItem, link: e.target.value })} placeholder="https://booking.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
              <input type="url" value={newItem.photoUrl} onChange={e => setNewItem({ ...newItem, photoUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAddItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Activity</button>
            <button onClick={() => setShowAddForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
          </div>
        </div>
      )}

      {/* ── Day Grid ── */}
      <div className="space-y-6">
        {days.map(day => {
          const dayItems = getItemsForDay(day.number);
          return (
            <div key={day.number} className="bg-white rounded-lg shadow-sm border">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Day {day.number} — {day.label}</h3>
              </div>
              <div className="p-6">
                {dayItems.length === 0 ? (
                  <p className="text-gray-500 italic">No activities planned for this day.</p>
                ) : (
                  <div className="space-y-4">
                    {dayItems.map(item => (
                      <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="type-badge">{getTypeLabel(item.type)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                          </div>
                          {item.startTime && <p className="text-sm text-gray-600 mt-1">Time: {item.startTime}</p>}
                          {item.location && <p className="text-sm text-gray-600 mt-1">Location: {item.location}</p>}
                          {item.notes && <p className="text-sm text-gray-700 mt-2">{item.notes}</p>}
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block">View link</a>
                          )}
                          {item.photoUrl && (
                            <img src={item.photoUrl} alt={item.title} className="mt-2 rounded-lg" style={{ maxHeight: '10rem', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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

      {/* ── Proposals Section ── */}
      <div style={{ marginTop: '2.5rem' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Activity Proposals</h2>
            <p className="text-sm text-gray-500 mt-0.5">Suggest ideas and let the group vote.</p>
          </div>
          <button onClick={() => setShowProposalForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Propose
          </button>
        </div>

        {showProposalForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-4">
            <h3 className="text-lg font-semibold mb-4">Propose an Activity</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity *</label>
                <input
                  value={newProposal.title}
                  onChange={e => setNewProposal(p => ({ ...p, title: e.target.value }))}
                  placeholder="Hot springs day trip, Museum visit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea
                  value={newProposal.description}
                  onChange={e => setNewProposal(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  placeholder="Why it would be great, cost, timing..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                <input
                  type="url"
                  value={newProposal.link}
                  onChange={e => setNewProposal(p => ({ ...p, link: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAddProposal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Submit Proposal</button>
              <button onClick={() => setShowProposalForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        )}

        {proposals.length === 0 && !showProposalForm && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
            No proposals yet. Be the first to suggest something!
          </div>
        )}

        <div className="space-y-3">
          {proposals.map(proposal => {
            const sentiment = getSentiment(proposal.votes);
            const myVote = proposal.votes[currentUserId];
            const vals = Object.values(proposal.votes);
            const yes = vals.filter(v => v === 'yes').length;
            const no = vals.filter(v => v === 'no').length;
            const maybe = vals.filter(v => v === 'maybe').length;

            return (
              <div key={proposal.id} className={`proposal-card sentiment-${sentiment}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{proposal.title}</h4>
                    {proposal.description && (
                      <p className="text-sm text-gray-600 mt-1">{proposal.description}</p>
                    )}
                    {proposal.link && (
                      <a href={proposal.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block">
                        View link
                      </a>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
                    <button
                      onClick={() => handleAddToItinerary(proposal)}
                      className="text-green-600 text-sm font-semibold hover:underline"
                      title="Add to itinerary"
                    >
                      Add to plan
                    </button>
                    <button onClick={() => handleDeleteProposal(proposal.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                  </div>
                </div>

                {/* Vote tally */}
                <div className="proposal-tally">
                  <span className="tally-yes">{yes} going</span>
                  <span className="tally-maybe">{maybe} maybe</span>
                  <span className="tally-no">{no} not going</span>
                </div>

                {/* Vote buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    onClick={() => handleVote(proposal.id, 'yes')}
                    className={`vote-btn${myVote === 'yes' ? ' vote-active-yes' : ''}`}
                  >
                    Going
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'maybe')}
                    className={`vote-btn${myVote === 'maybe' ? ' vote-active-maybe' : ''}`}
                  >
                    Maybe
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'no')}
                    className={`vote-btn${myVote === 'no' ? ' vote-active-no' : ''}`}
                  >
                    Not going
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
