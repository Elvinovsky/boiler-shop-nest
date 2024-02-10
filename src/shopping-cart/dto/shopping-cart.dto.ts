import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 'Elvin' })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  userId?: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  readonly partId: number;
}
