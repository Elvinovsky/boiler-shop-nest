import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BoilerPartsService } from './boiler-parts.service';
import {
  GetBestsellerResponse,
  GetByNameResponse,
  GetNewResponse,
  GetOneResponse,
  IQueryBoilerParts,
  IQuerySearchPartsInput,
  PaginatedAndFilterResponse,
  SearchResponse,
} from './types';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

@Controller('boiler-parts')
export class BoilerPartsController {
  constructor(private readonly boilerPartsService: BoilerPartsService) {}

  @ApiOkResponse({ type: PaginatedAndFilterResponse })
  @UseGuards(AuthenticatedGuard)
  @Get()
  paginatedAndFilter(@Query() query: IQueryBoilerParts) {
    console.log(query);
    return this.boilerPartsService.paginatedAndFilter(query);
  }

  @ApiOkResponse({ type: GetOneResponse })
  @UseGuards(AuthenticatedGuard)
  @Get('find/:id')
  getOne(@Param('id') id: string) {
    return this.boilerPartsService.findOne(Number(id));
  }

  @ApiOkResponse({ type: GetBestsellerResponse })
  @UseGuards(AuthenticatedGuard)
  @Get('bestsellers')
  getBestseller() {
    return this.boilerPartsService.bestseller();
  }

  @ApiOkResponse({ type: GetNewResponse })
  @UseGuards(AuthenticatedGuard)
  @Get('new')
  getNew() {
    return this.boilerPartsService.new();
  }

  @ApiOkResponse({ type: SearchResponse })
  @ApiQuery({
    name: 'search',
    type: String,
    required: true,
    description: 'String to search',
  })
  @UseGuards(AuthenticatedGuard)
  @Get('search')
  searchStr(@Query() searchStr: IQuerySearchPartsInput) {
    console.log(searchStr.str);
    return this.boilerPartsService.searchByString(searchStr.str);
  }

  @ApiOkResponse({ type: GetByNameResponse })
  @ApiQuery({
    name: 'name',
    type: String,
    required: true,
    description: 'Name of the boiler part',
  })
  @UseGuards(AuthenticatedGuard)
  @Get('name')
  getByName(@Query('name') boilerPartsName: string) {
    return this.boilerPartsService.findOneByName(boilerPartsName);
  }
}
