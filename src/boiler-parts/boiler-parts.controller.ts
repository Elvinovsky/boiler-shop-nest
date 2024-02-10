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
  GetByNameRequest,
  GetByNameResponse,
  GetNewResponse,
  GetOneResponse,
  IQueryBoilerParts,
  PaginatedAndFilterResponse,
  SearchRequest,
  SearchResponse,
} from './types';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('boiler-parts')
export class BoilerPartsController {
  constructor(private readonly boilerPartsService: BoilerPartsService) {}

  @ApiOkResponse({ type: PaginatedAndFilterResponse })
  @UseGuards(AuthenticatedGuard)
  @Get()
  paginatedAndFilter(@Query() query: IQueryBoilerParts) {
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
  @Get('bestseller')
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
  @UseGuards(AuthenticatedGuard)
  @Post('search')
  searchStr(@Body() search: SearchRequest) {
    return this.boilerPartsService.searchByString(search.string);
  }

  @ApiOkResponse({ type: GetByNameResponse })
  @UseGuards(AuthenticatedGuard)
  @Post('name')
  getByName(@Body() { name }: GetByNameRequest) {
    return this.boilerPartsService.findOneByName(name);
  }
}
