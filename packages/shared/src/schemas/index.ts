import { z } from 'zod'

// Enums as Zod schemas
export const userRoleSchema = z.enum(['SUPER_ADMIN', 'ORGANIZER', 'STAFF', 'RUNNER'])
export const orgMemberRoleSchema = z.enum(['OWNER', 'ADMIN', 'STAFF'])
export const eventStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'])
export const paymentMethodSchema = z.enum([
  'QRPH',
  'GCASH',
  'MAYA',
  'CARD',
  'BANK_TRANSFER',
  'CASH',
  'FREE',
])
export const paymentStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED', 'CANCELLED'])
export const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHER'])
export const shirtSizeSchema = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'])

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
})

export const updateOrganizationSchema = createOrganizationSchema.partial()

// Bank details schema
export const bankDetailsSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
})

// Event schemas
export const createEventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  date: z.coerce.date(),
  location: z.string().min(3, 'Location is required'),
  locationMapUrl: z.string().url().optional().or(z.literal('')),
  registrationOpen: z.coerce.date(),
  registrationClose: z.coerce.date(),
  paymentMethods: z.array(paymentMethodSchema).min(1, 'At least one payment method is required'),
  bankDetails: bankDetailsSchema.optional(),
  cashInstructions: z.string().optional(),
})

export const updateEventSchema = createEventSchema.partial()

// Race category schemas
export const createRaceCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  distance: z.number().positive().optional(),
  price: z.number().nonnegative('Price must be non-negative'),
  earlyBirdPrice: z.number().nonnegative().optional(),
  earlyBirdDeadline: z.coerce.date().optional(),
  slotLimit: z.number().int().positive().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
})

export const updateRaceCategorySchema = createRaceCategorySchema.partial()

// Registration schemas
export const createRegistrationSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  runnerName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
  birthdate: z.coerce.date(),
  gender: genderSchema,
  shirtSize: shirtSizeSchema,
  emergencyName: z.string().min(2, 'Emergency contact name is required'),
  emergencyPhone: z.string().min(10, 'Emergency contact phone is required'),
  emergencyRelation: z.string().min(2, 'Relationship is required'),
  paymentMethod: paymentMethodSchema,
})

// Payment confirmation schema
export const confirmPaymentSchema = z.object({
  notes: z.string().optional(),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
})

// Export types inferred from schemas
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type CreateRaceCategoryInput = z.infer<typeof createRaceCategorySchema>
export type UpdateRaceCategoryInput = z.infer<typeof updateRaceCategorySchema>
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
