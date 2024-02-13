import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MakePaymentDto {
  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;

  @ApiProperty({ example: 'Заказ № 1' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
