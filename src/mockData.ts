import { Trip } from './types'

export const sampleTrips: Trip[] = [
  {
    id: 'trip1',
    name: 'Weekend in Lisbon',
    destination: 'Lisbon, Portugal',
    startDate: '2026-05-01',
    endDate: '2026-05-05',
    travelers: [
      { id: 't1', name: 'Alice', email: 'alice@example.com' },
      { id: 't2', name: 'Bob', email: 'bob@example.com' },
    ],
    itinerary: [
      {
        id: 'it1',
        day: 1,
        title: 'Arrive & check-in',
        type: 'transport',
        date: '2026-05-01',
        startTime: '14:00',
        location: 'Airport / Hotel',
        notes: 'Pick up rental car'
      },
      {
        id: 'it2',
        day: 1,
        title: 'Dinner at Time Out Market',
        type: 'restaurant',
        date: '2026-05-01',
        startTime: '19:30',
        location: 'Time Out Market',
      }
    ],
    expenses: [
      {
        id: 'e1',
        description: 'Hotel (3 nights)',
        amount: 450,
        currency: 'EUR',
        date: '2026-05-01',
        payerId: 't1',
        participantIds: ['t1', 't2'],
        splits: [
          { travelerId: 't1', amount: 225 },
          { travelerId: 't2', amount: 225 }
        ],
        category: 'accommodation'
      },
      {
        id: 'e2',
        description: 'Group dinner',
        amount: 80,
        currency: 'EUR',
        date: '2026-05-01',
        payerId: 't2',
        participantIds: ['t1','t2'],
        splits: [
          { travelerId: 't1', amount: 40 },
          { travelerId: 't2', amount: 40 }
        ],
        category: 'food'
      }
    ],
    packing: [
      { id: 'p1', name: 'Phone charger', assignedToId: 't1', packed: false },
      { id: 'p2', name: 'Toothbrush', assignedToId: 't2', packed: true }
    ],
    documents: [
      { id: 'd1', title: 'Flight confirmation', type: 'flight', info: 'ABC123', link: 'https://airline.example/booking/ABC123' },
      { id: 'd2', title: 'Hotel reservation', type: 'hotel', info: 'Reservation #456' }
    ],
    notes: 'Bring universal power adapter'
  }
]

export default sampleTrips
