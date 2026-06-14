export interface Traveler {
  id: string
  name: string
  email?: string
}

export interface Collaborator {
  id: string
  name?: string
  email?: string
  ownerId: string
  invitedAt: string
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
  link?: string
  photoUrl?: string
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
  photoKey?: string
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
  fileKey?: string
}

export interface Proposal {
  id: string
  title: string
  description?: string
  link?: string
  proposedByUserId: string
  votes: Record<string, 'yes' | 'no' | 'maybe'>
  createdAt: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  owners: string[]
  collaborators: Collaborator[]
  travelers: Traveler[]
  itinerary: ItineraryItem[]
  expenses: Expense[]
  packing: PackingItem[]
  documents: DocumentItem[]
  proposals: Proposal[]
  notes?: string
}

export type ID = string
