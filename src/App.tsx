import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TripList } from './components/TripList';
import { CreateTrip } from './components/CreateTrip';
import { TripDashboard } from './components/TripDashboard';
import { Itinerary } from './components/Itinerary';
import { Expenses } from './components/Expenses';
import { Packing } from './components/Packing';
import { Documents } from './components/Documents';
import { Trip, ItineraryItem, Expense, PackingItem, DocumentItem } from './types';
import { sampleTrips } from './mockData';

function AppContent() {
  const [trips, setTrips] = useState<Trip[]>(sampleTrips);
  const navigate = useNavigate();

  const handleCreateTrip = (tripData: Omit<Trip, 'id'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: `trip_${Date.now()}`
    };
    setTrips([...trips, newTrip]);
    navigate(`/trip/${newTrip.id}`);
  };

  const updateTrip = (tripId: string, updates: Partial<Trip>) => {
    setTrips(trips.map(trip => 
      trip.id === tripId ? { ...trip, ...updates } : trip
    ));
  };

  const TripWrapper = ({ children }: { children: (trip: Trip) => React.ReactNode }) => {
    const { tripId } = useParams();
    const trip = trips.find(t => t.id === tripId);
    
    if (!trip) {
      return <Navigate to="/" replace />;
    }
    
    return <>{children(trip)}</>;
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TripList trips={trips} />} />
        <Route path="/create" element={<CreateTrip onCreateTrip={handleCreateTrip} />} />
        <Route 
          path="/trip/:tripId" 
          element={
            <TripWrapper>
              {(trip) => <TripDashboard trip={trip} />}
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
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
