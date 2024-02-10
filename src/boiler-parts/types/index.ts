import { ApiProperty } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { IsNotEmpty, IsString } from 'class-validator';

export class BoilerParts {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: faker.lorem.sentence(2) })
  boiler_manufacturer: string;

  @ApiProperty({ example: 12345 })
  price: number;

  @ApiProperty({ example: faker.lorem.sentence(1) })
  parts_manufacturer: string;

  @ApiProperty({ example: faker.internet.password() })
  vendor_code: string;

  @ApiProperty({ example: faker.lorem.sentence(2) })
  name: string;

  @ApiProperty({ example: faker.lorem.sentence() })
  description: string;

  @ApiProperty({ example: faker.image.city() })
  images: string;

  @ApiProperty({ example: 23 })
  in_stock: number;

  @ApiProperty({ example: false })
  bestseller: boolean;

  @ApiProperty({ example: true })
  new: boolean;

  @ApiProperty({ example: faker.number.int({ min: 100, max: 999 }) })
  popularity: number;

  @ApiProperty({ example: faker.lorem.sentence() })
  compatibility: string;

  @ApiProperty({ example: '2024-02-09T17:48:19.195Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-02-09T17:48:19.195Z' })
  updatedAt: string;
}

export class PaginatedAndFilterResponse {
  @ApiProperty({ example: 123 })
  count: number;
  @ApiProperty({ example: BoilerParts, isArray: true })
  rows: BoilerParts;
}

export class Bestseller extends BoilerParts {
  @ApiProperty({ example: true })
  bestseller: boolean;
}
export class GetBestsellerResponse extends PaginatedAndFilterResponse {
  @ApiProperty({ example: 123 })
  count: number;
  @ApiProperty({ example: BoilerParts, isArray: true })
  rows: Bestseller;
}

export class NewParts extends BoilerParts {
  @ApiProperty({ example: true })
  new: boolean;
}
export class GetNewResponse extends PaginatedAndFilterResponse {
  @ApiProperty({ example: 123 })
  count: number;
  @ApiProperty({ example: BoilerParts, isArray: true })
  rows: NewParts;
}

export class SearchResponse extends PaginatedAndFilterResponse {}
export class SearchRequest {
  @ApiProperty({ example: 'd' })
  @IsNotEmpty()
  @IsString()
  string: string;
}

export class GetByNameResponse extends BoilerParts {
  @ApiProperty({ example: 'dildo' })
  name: string;
}
export class GetByNameRequest {
  @ApiProperty({ example: 'dildo' })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class GetOneResponse extends BoilerParts {}

export interface IQueryBoilerParts {
  limit: string;
  offset: string;
}
