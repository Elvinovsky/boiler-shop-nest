import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Elvin' })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({ example: 'Elvin123' })
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({ example: 'Elvin1@gmail.com' })
  @IsNotEmpty()
  readonly email: string;
}
