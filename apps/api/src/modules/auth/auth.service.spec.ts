import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'
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
    signAsync: jest.fn(),
    verify: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_REFRESH_EXPIRATION: '7d',
      }
      return config[key] ?? defaultValue
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
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

  describe('login', () => {
    const mockLoginDto = {
      email: 'test@example.com',
      password: 'password123',
    }

    // Real bcrypt hash for 'password123' with 12 rounds
    const realPasswordHash = bcrypt.hashSync('password123', 12)

    const mockExistingUser = {
      id: 'user-uuid',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.RUNNER,
      emailVerified: true,
      passwordHash: realPasswordHash,
      emailVerifyToken: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    }

    const mockRefreshTokenRecord = {
      id: 'refresh-token-uuid',
      userId: 'user-uuid',
      token: 'random-token-identifier',
      expiresAt: new Date(),
      createdAt: new Date(),
      revokedAt: null,
    }

    it('should return tokens and user on valid login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser)
      mockPrismaService.refreshToken.create.mockResolvedValue(
        mockRefreshTokenRecord
      )
      mockJwtService.signAsync
        .mockResolvedValueOnce('mock-access-token')
        .mockResolvedValueOnce('mock-refresh-token')

      const result = await service.login(mockLoginDto)

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: mockExistingUser.id,
          email: mockExistingUser.email,
          name: mockExistingUser.name,
          role: mockExistingUser.role,
          emailVerified: mockExistingUser.emailVerified,
          createdAt: mockExistingUser.createdAt,
          updatedAt: mockExistingUser.updatedAt,
        },
      })
      expect(result.user).not.toHaveProperty('passwordHash')
    })

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException
      )
      await expect(
        service.login({ ...mockLoginDto, email: 'nonexistent@example.com' })
      ).rejects.toThrow('Invalid email or password')
    })

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser)

      const wrongPasswordDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      await expect(service.login(wrongPasswordDto)).rejects.toThrow(
        UnauthorizedException
      )
      await expect(service.login(wrongPasswordDto)).rejects.toThrow(
        'Invalid email or password'
      )
    })

    it('should normalize email to lowercase when looking up user', async () => {
      const upperCaseEmailDto = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      }
      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser)
      mockPrismaService.refreshToken.create.mockResolvedValue(
        mockRefreshTokenRecord
      )
      mockJwtService.signAsync
        .mockResolvedValueOnce('mock-access-token')
        .mockResolvedValueOnce('mock-refresh-token')

      await service.login(upperCaseEmailDto)

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
    })

    it('should compare password with bcrypt', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser)
      mockPrismaService.refreshToken.create.mockResolvedValue(
        mockRefreshTokenRecord
      )
      mockJwtService.signAsync.mockResolvedValue('mock-token')

      // Valid password should succeed
      const result = await service.login(mockLoginDto)
      expect(result.accessToken).toBeDefined()

      // Invalid password should fail
      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser)
      await expect(
        service.login({ ...mockLoginDto, password: 'wrongpassword' })
      ).rejects.toThrow(UnauthorizedException)
    })

    it('should store refresh token in database', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser)
      mockPrismaService.refreshToken.create.mockResolvedValue(
        mockRefreshTokenRecord
      )
      mockJwtService.signAsync.mockResolvedValue('mock-token')

      await service.login(mockLoginDto)

      expect(mockPrismaService.refreshToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockExistingUser.id,
          token: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      })
    })

    it('should generate access token with correct payload', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser)
      mockPrismaService.refreshToken.create.mockResolvedValue(
        mockRefreshTokenRecord
      )
      mockJwtService.signAsync.mockResolvedValue('mock-token')

      await service.login(mockLoginDto)

      // First call is for access token
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockExistingUser.id,
        email: mockExistingUser.email,
        role: mockExistingUser.role,
      })
    })

    it('should generate refresh token with correct options', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser)
      mockPrismaService.refreshToken.create.mockResolvedValue(
        mockRefreshTokenRecord
      )
      mockJwtService.signAsync.mockResolvedValue('mock-token')

      await service.login(mockLoginDto)

      // Second call is for refresh token with additional options
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: mockExistingUser.id,
          tokenId: mockRefreshTokenRecord.id,
        },
        {
          secret: 'test-refresh-secret',
          expiresIn: '7d',
        }
      )
    })
  })
})
