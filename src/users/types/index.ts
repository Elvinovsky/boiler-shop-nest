import { ApiProperty } from '@nestjs/swagger';

export class LoginUserRequest {
  @ApiProperty({ example: 'Elvin' })
  username: string;

  @ApiProperty({ example: 'el123' })
  password: string;
}

export class LoginUserResponse {
  @ApiProperty({
    example: {
      user: {
        userId: 3,
        userName: 'Elvin',
        email: 'Elvin@gmail.com',
      },
    },
  })
  user: {
    userId: number;
    userName: string;
    email: string;
  };

  @ApiProperty({ example: 'Logged in' })
  msg: string;
}

export class LoginCheckResponse {
  @ApiProperty({
    example: 3,
  })
  userId: number;

  @ApiProperty({
    example: 'Elvin',
  })
  userName: string;

  @ApiProperty({
    example: 'Elvin@gmail.com',
  })
  email: string;
}

export class LogoutUserResponse {
  @ApiProperty({ example: 'Session has ended' })
  msg: string;
}

export class SignUpResponse {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: 'Elvin' })
  username: string;

  @ApiProperty({ example: 'Elvin@gmail.com' })
  email: string;

  @ApiProperty({ example: '$2b$12$.YwO5d1vi2NZthXOC1f5ReEgsBFZ6kxa' })
  password: string;

  @ApiProperty({ example: '2024-02-08T02:52:31.489Z' })
  updatedAt: string;

  @ApiProperty({ example: '2024-02-08T02:52:31.489Z' })
  createdAt: string;
}

export class ErrorMessage {
  @ApiProperty({ example: { warningMessage: 'описание ошибки' } })
  warningMessage: string;
}
