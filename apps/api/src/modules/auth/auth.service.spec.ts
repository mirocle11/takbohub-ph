import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConflictException } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { AuthService } from './auth.service'
import { PrismaService } from '@/prisma/prisma.service'

describe('AuthService', () => {
  let service: AuthService
  let _prisma: PrismaService
  let _jwtService: JwtService

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    _prisma = module.get<PrismaService>(PrismaService)
    _jwtService = module.get<JwtService>(JwtService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('register', () => {
    const mockRegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    }

    const mockCreatedUser = {
      id: 'test-uuid',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.RUNNER,
      emailVerified: false,
      emailVerifyToken: 'mock-token',
      passwordHash: '$2b$12$hashedpassword',
      passwordResetToken: null,
      passwordResetExpires: null,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    }

    it('should successfully register a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser)

      const result = await service.register(mockRegisterDto)

      expect(result).toEqual({
        id: mockCreatedUser.id,
        email: mockCreatedUser.email,
        name: mockCreatedUser.name,
        role: mockCreatedUser.role,
        emailVerified: mockCreatedUser.emailVerified,
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
      })
      expect(result).not.toHaveProperty('passwordHash')
      expect(result).not.toHaveProperty('emailVerifyToken')
    })

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockCreatedUser)

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        ConflictException
      )
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'A user with this email already exists'
      )
    })

    it('should normalize email to lowercase', async () => {
      const upperCaseEmailDto = {
        ...mockRegisterDto,
        email: 'TEST@EXAMPLE.COM',
      }
      mockPrismaService.user.findUnique.mockResolvedValue(null)
      mockPrismaService.user.create.mockResolvedValue({
        ...mockCreatedUser,
        email: 'test@example.com',
      })

      await service.register(upperCaseEmailDto)

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
        }),
      })
    })

    it('should hash password with bcrypt', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser)

      await service.register(mockRegisterDto)

      const createCall = mockPrismaService.user.create.mock.calls[0][0]
      expect(createCall.data.passwordHash).not.toBe(mockRegisterDto.password)
      expect(createCall.data.passwordHash).toMatch(/^\$2[ab]\$12\$/)
    })

    it('should create user with RUNNER role by default', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser)

      await service.register(mockRegisterDto)

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: UserRole.RUNNER,
          emailVerified: false,
        }),
      })
    })

    it('should generate email verification token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser)

      await service.register(mockRegisterDto)

      const createCall = mockPrismaService.user.create.mock.calls[0][0]
      expect(createCall.data.emailVerifyToken).toBeDefined()
      expect(typeof createCall.data.emailVerifyToken).toBe('string')
      expect(createCall.data.emailVerifyToken.length).toBe(64) // 32 bytes = 64 hex chars
    })
  })
})
