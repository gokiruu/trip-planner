export interface Traveler {
  id: string
  name: string
  email?: string
}

export interface ItineraryItem {
  id: string
  day: number
  title: string
  type?: 'activity' | 'restaurant' | 'hotel' | 'transport'
  date?: string
  startTime?: string
  endTime?: string
  location?: string
  notes?: string
}

export interface ExpenseShare {
  travelerId: string
  amount: number
}

export interface Expense {
  id: string
  description: string
  amount: number
  currency?: string
  date?: string
  payerId: string
  participantIds: string[]
  splits?: ExpenseShare[]
  category?: string
  receiptUrl?: string
}

export interface PackingItem {
  id: string
  name: string
  quantity?: number
  assignedToId?: string
  packed?: boolean
  notes?: string
}

export interface DocumentItem {
  id: string
  title: string
  type?: string
  info?: string
  link?: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  travelers: Traveler[]
  itinerary: ItineraryItem[]
  expenses: Expense[]
  packing: PackingItem[]
  documents: DocumentItem[]
  notes?: string
}

export type ID = string
