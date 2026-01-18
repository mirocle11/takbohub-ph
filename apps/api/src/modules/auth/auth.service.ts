import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UserRole } from '@prisma/client'
import { randomBytes } from 'crypto'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '@/prisma/prisma.service'
import { LoginDto, RegisterDto, UserResponseDto } from './dto'

interface JwtPayload {
  sub: string
  email: string
  role: UserRole
}

interface RefreshTokenPayload {
  sub: string
  tokenId: string
}

interface LoginResult {
  accessToken: string
  refreshToken: string
  user: UserResponseDto
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly BCRYPT_ROUNDS = 12

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto): Promise<UserResponseDto> {
    const normalizedEmail = dto.email.toLowerCase()

    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      throw new ConflictException('A user with this email already exists')
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS)

    // Generate email verification token
    const emailVerifyToken = randomBytes(32).toString('hex')

    // Create user in database
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: dto.name,
        role: UserRole.RUNNER,
        emailVerified: false,
        emailVerifyToken,
      },
    })

    // Queue verification email (placeholder for BullMQ implementation)
    this.logger.log(`Email verification token generated for user ${user.id}`)
    // TODO: Implement with BullMQ when email module is ready
    // await this.emailQueue.add('send-verification', { userId: user.id, email: user.email, token: emailVerifyToken })

    // Return user without sensitive fields
    return this.excludeSensitiveFields(user)
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const normalizedEmail = dto.email.toLowerCase()

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Generic error for security (don't reveal if email exists)
    if (!user) {
      this.logger.debug(
        `Login attempt failed: email not found - ${normalizedEmail}`
      )
      throw new UnauthorizedException('Invalid email or password')
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash)

    if (!isPasswordValid) {
      this.logger.debug(
        `Login attempt failed: invalid password for user ${user.id}`
      )
      throw new UnauthorizedException('Invalid email or password')
    }

    // Generate tokens
    const accessToken = await this.generateAccessToken(user)
    const refreshToken = await this.generateRefreshToken(user)

    this.logger.log(`User ${user.id} logged in successfully`)

    return {
      accessToken,
      refreshToken,
      user: this.excludeSensitiveFields(user),
    }
  }

  private async generateAccessToken(user: {
    id: string
    email: string
    role: UserRole
  }): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    return this.jwtService.signAsync(payload)
  }

  private async generateRefreshToken(user: { id: string }): Promise<string> {
    // Calculate expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Generate a random token identifier for DB storage
    const tokenIdentifier = randomBytes(32).toString('hex')

    // Store refresh token record in database
    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokenIdentifier,
        expiresAt,
      },
    })

    // Create JWT with the token ID for lookup/revocation
    const payload: RefreshTokenPayload = {
      sub: user.id,
      tokenId: refreshTokenRecord.id,
    }

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')
    const refreshExpiration = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d'
    )

    return this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiration,
    })
  }

  private excludeSensitiveFields(user: {
    id: string
    email: string
    name: string
    role: UserRole
    emailVerified: boolean
    createdAt: Date
    updatedAt: Date
    passwordHash?: string
    emailVerifyToken?: string | null
    passwordResetToken?: string | null
    passwordResetExpires?: Date | null
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
