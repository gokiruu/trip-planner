import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate, useNavigate } from 'react-router-dom';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import { Layout } from './components/Layout';
import { TripList } from './components/TripList';
import { CreateTrip } from './components/CreateTrip';
import { TripDashboard } from './components/TripDashboard';
import { Itinerary } from './components/Itinerary';
import { Expenses } from './components/Expenses';
import { Packing } from './components/Packing';
import { Documents } from './components/Documents';
import { Trip, Traveler, ItineraryItem, Expense, PackingItem, DocumentItem, Collaborator } from './types';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

// Array fields are stored as JSON strings (a.string()) to avoid AWSJSON validation issues.
function parseArr<T>(value: string | null | undefined): T[] {
  if (!value) return [];
  try { return JSON.parse(value) as T[]; }
  catch { return []; }
}

function toTrip(raw: Schema['Trip']['type']): Trip {
  return {
    id: raw.id,
    name: raw.name ?? '',
    destination: raw.destination ?? '',
    startDate: raw.startDate ?? '',
    endDate: raw.endDate ?? '',
    owners: ((raw.owners as string[] | null) ?? []).filter(Boolean),
    collaborators: parseArr<Collaborator>(raw.collaborators),
    travelers: parseArr<Traveler>(raw.travelers),
    itinerary: parseArr<ItineraryItem>(raw.itinerary),
    expenses: parseArr<Expense>(raw.expenses),
    packing: parseArr<PackingItem>(raw.packing),
    documents: parseArr<DocumentItem>(raw.documents),
    notes: raw.notes ?? undefined,
  };
}

function AppContent() {
  const { signOut } = useAuthenticator();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentOwnerId, setCurrentOwnerId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getCurrentUser(),
      client.models.Trip.list(),
    ])
      .then(([user, { data }]) => {
        setCurrentOwnerId(user.userId);
        setTrips(data.map(toTrip));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreateTrip = async (tripData: Omit<Trip, 'id'>) => {
    const { data: newTrip, errors } = await client.models.Trip.create({
      name: tripData.name,
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      owners: currentOwnerId ? [currentOwnerId] : undefined,
      travelers: tripData.travelers.length > 0 ? JSON.stringify(tripData.travelers) : undefined,
      notes: tripData.notes || undefined,
    });
    if (errors?.length) throw new Error(errors.map(e => e.message).join('; '));
    if (newTrip) {
      const trip = toTrip(newTrip as Schema['Trip']['type']);
      setTrips(prev => [...prev, trip]);
      navigate(`/trip/${trip.id}`);
    }
  };

  const JSON_ARRAY_FIELDS = new Set(['collaborators', 'travelers', 'itinerary', 'expenses', 'packing', 'documents']);

  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    const payload: Record<string, unknown> = { id: tripId };
    for (const [key, value] of Object.entries(updates)) {
      payload[key] = JSON_ARRAY_FIELDS.has(key) && Array.isArray(value)
        ? JSON.stringify(value)
        : value;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, errors } = await (client.models.Trip.update as any)(payload);
    if (errors?.length) { console.error('Update trip errors:', errors); return; }
    if (updated) {
      setTrips(prev => prev.map(t => t.id === tripId ? toTrip(updated as Schema['Trip']['type']) : t));
    }
  };

  const shareTrip = async (tripId: string, collaborator: Omit<Collaborator, 'id' | 'invitedAt'>) => {
    const trip = trips.find(t => t.id === tripId);
    const ownerId = collaborator.ownerId.trim();
    if (!trip || !ownerId) return;

    const owners = Array.from(new Set([...trip.owners, currentOwnerId, ownerId].filter(Boolean)));
    const collaborators = [
      ...trip.collaborators.filter(item => item.ownerId !== ownerId),
      {
        ...collaborator,
        id: `collab_${Date.now()}`,
        ownerId,
        invitedAt: new Date().toISOString(),
      },
    ];

    await updateTrip(tripId, { owners, collaborators });
  };

  const removeCollaborator = async (tripId: string, ownerId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip || ownerId === currentOwnerId) return;

    const newCollaborators = trip.collaborators.filter(item => item.ownerId !== ownerId);
    await updateTrip(tripId, {
      owners: trip.owners.filter(id => id !== ownerId),
      collaborators: newCollaborators,
    });
  };

  const TripWrapper = ({ children }: { children: (trip: Trip) => React.ReactNode }) => {
    const { tripId } = useParams();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return <Navigate to="/" replace />;
    return <>{children(trip)}</>;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#6b7280' }}>
        Loading trips...
      </div>
    );
  }

  return (
    <Layout onSignOut={signOut}>
      <Routes>
        <Route path="/" element={<TripList trips={trips} />} />
        <Route path="/create" element={<CreateTrip onCreateTrip={handleCreateTrip} />} />
        <Route
          path="/trip/:tripId"
          element={
            <TripWrapper>
              {(trip) => (
                <TripDashboard
                  trip={trip}
                  currentOwnerId={currentOwnerId}
                  onShareTrip={(collaborator) => shareTrip(trip.id, collaborator)}
                  onRemoveCollaborator={(ownerId) => removeCollaborator(trip.id, ownerId)}
                />
              )}
            </TripWrapper>
          }
        />
        <Route
          path="/trip/:tripId/itinerary"
          element={
            <TripWrapper>
              {(trip) => (
                <Itinerary
                  trip={trip}
                  onUpdateItinerary={(items: ItineraryItem[]) =>
                    updateTrip(trip.id, { itinerary: items })
                  }
                />
              )}
            </TripWrapper>
          }
        />
        <Route
          path="/trip/:tripId/expenses"
          element={
            <TripWrapper>
              {(trip) => (
                <Expenses
                  trip={trip}
                  onUpdateExpenses={(expenses: Expense[]) =>
                    updateTrip(trip.id, { expenses })
                  }
                />
              )}
            </TripWrapper>
          }
        />
        <Route
          path="/trip/:tripId/packing"
          element={
            <TripWrapper>
              {(trip) => (
                <Packing
                  trip={trip}
                  onUpdatePacking={(items: PackingItem[]) =>
                    updateTrip(trip.id, { packing: items })
                  }
                />
              )}
            </TripWrapper>
          }
        />
        <Route
          path="/trip/:tripId/documents"
          element={
            <TripWrapper>
              {(trip) => (
                <Documents
                  trip={trip}
                  onUpdateDocuments={(documents: DocumentItem[]) =>
                    updateTrip(trip.id, { documents })
                  }
                />
              )}
            </TripWrapper>
          }
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Authenticator>
      <Router>
        <AppContent />
      </Router>
    </Authenticator>
  );
}

export default App;
