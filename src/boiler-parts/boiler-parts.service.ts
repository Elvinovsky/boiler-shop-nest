import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BoilerParts } from './boiler-parts.model';
import { IBoilerPartsFilter, IQueryBoilerParts } from './types';
import { Op } from 'sequelize';

@Injectable()
export class BoilerPartsService {
  constructor(
    @InjectModel(BoilerParts)
    private readonly boilerPartsModel: typeof BoilerParts,
  ) {}
  async paginatedAndFilter(
    query: IQueryBoilerParts,
  ): Promise<{ count: number; rows: BoilerParts[] }> {
    const limit = +query.limit;
    const offset = +query.offset * 20;

    const filter = {} as Partial<IBoilerPartsFilter>;

    if (query.priceTo && query.priceFrom) {
      filter.price = { [Op.between]: [+query.priceFrom, +query.priceTo] };
    }

    if (query.boiler) {
      filter.boiler_manufacturer = JSON.parse(decodeURIComponent(query.boiler));
    }
    if (query.parts) {
      filter.parts_manufacturer = JSON.parse(decodeURIComponent(query.parts));
    }
    console.log(filter);
    console.log(query);
    return this.boilerPartsModel.findAndCountAll({
      limit,
      offset,
      where: filter,
    });
  }

  async bestseller(): Promise<{ count: number; rows: BoilerParts[] }> {
    return this.boilerPartsModel.findAndCountAll({
      where: { bestseller: true },
    });
  }

  async new(): Promise<{ count: number; rows: BoilerParts[] }> {
    return this.boilerPartsModel.findAndCountAll({
      where: { new: true },
    });
  }

  async findOne(id: number): Promise<BoilerParts> {
    return this.boilerPartsModel.findOne({
      where: { id },
    });
  }

  async findOneByName(boilerPartsName: string): Promise<BoilerParts> {
    return this.boilerPartsModel.findOne({
      where: { name: boilerPartsName },
    });
  }

  async searchByString(
    str: string,
  ): Promise<{ count: number; rows: BoilerParts[] }> {
    return this.boilerPartsModel.findAndCountAll({
      limit: 20,
      where: { name: { [Op.like]: `%${str}%` } },
    });
  }
}
