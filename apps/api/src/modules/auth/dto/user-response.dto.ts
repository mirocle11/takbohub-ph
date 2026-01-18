import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string

  @ApiProperty({ example: 'user@example.com' })
  email: string

  @ApiProperty({ example: 'Juan dela Cruz' })
  name: string

  @ApiProperty({
    enum: ['SUPER_ADMIN', 'ORGANIZER', 'STAFF', 'RUNNER'],
    example: 'RUNNER',
  })
  role: UserRole

  @ApiProperty({ example: false })
  emailVerified: boolean

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date
}
