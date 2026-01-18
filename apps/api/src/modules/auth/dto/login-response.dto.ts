import { ApiProperty } from '@nestjs/swagger'
import { UserResponseDto } from './user-response.dto'

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token (expires in 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string

  @ApiProperty({
    description: 'Authenticated user information',
    type: UserResponseDto,
  })
  user: UserResponseDto
}
