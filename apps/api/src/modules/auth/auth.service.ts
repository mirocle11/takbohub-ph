import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserRole } from '@prisma/client'
import { randomBytes } from 'crypto'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '@/prisma/prisma.service'
import { RegisterDto, UserResponseDto } from './dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly BCRYPT_ROUNDS = 12

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
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
