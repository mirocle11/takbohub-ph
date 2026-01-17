// User roles
export type UserRole = 'SUPER_ADMIN' | 'ORGANIZER' | 'STAFF' | 'RUNNER'

// Organization member roles
export type OrgMemberRole = 'OWNER' | 'ADMIN' | 'STAFF'

// Event status
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED'

// Payment methods
export type PaymentMethod = 'QRPH' | 'GCASH' | 'MAYA' | 'CARD' | 'BANK_TRANSFER' | 'CASH' | 'FREE'

// Payment status
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'

// Gender
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

// Shirt sizes
export type ShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

// User type
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

// Organization type
export interface Organization {
  id: string
  name: string
  slug: string
  ownerId: string
  logoUrl?: string
  createdAt: Date
  updatedAt: Date
}

// Event type
export interface Event {
  id: string
  organizationId: string
  name: string
  slug: string
  description?: string
  date: Date
  location: string
  locationMapUrl?: string
  bannerUrl?: string
  registrationOpen: Date
  registrationClose: Date
  status: EventStatus
  paymentMethods: PaymentMethod[]
  bankDetails?: BankDetails
  cashInstructions?: string
  createdAt: Date
  updatedAt: Date
}

// Bank details for transfers
export interface BankDetails {
  bankName: string
  accountName: string
  accountNumber: string
}

// Race category type
export interface RaceCategory {
  id: string
  eventId: string
  name: string
  distance?: number
  price: number
  earlyBirdPrice?: number
  earlyBirdDeadline?: Date
  slotLimit?: number
  slotsTaken: number
  sortOrder: number
}

// Registration type
export interface Registration {
  id: string
  eventId: string
  categoryId: string
  userId?: string
  runnerName: string
  email: string
  phone: string
  birthdate: Date
  gender: Gender
  shirtSize: ShirtSize
  emergencyName: string
  emergencyPhone: string
  emergencyRelation: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  proofUrl?: string
  amountPaid?: number
  bibNumber?: string
  confirmedBy?: string
  confirmedAt?: Date
  notes?: string
  registeredAt: Date
}

// Payment type
export interface Payment {
  id: string
  registrationId: string
  paymongoPaymentId?: string
  paymongoCheckoutId?: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod: PaymentMethod
  metadata?: Record<string, unknown>
  paidAt?: Date
  createdAt: Date
}

// API response types
export interface ApiResponse<T> {
  data: T
  meta?: {
    pagination?: PaginationMeta
  }
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface ApiError {
  statusCode: number
  message: string
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
}
