import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { SequelizeConfigService } from '../../src/config/SequelizeConfig.service';
import { databaseConfig } from '../../src/config/configuration';
import { BoilerPartsModule } from '../../src/boiler-parts/boiler-parts.module';
import { BoilerPartsService } from '../../src/boiler-parts/boiler-parts.service';

describe('BoilerParts service', () => {
  let app: INestApplication;
  let boilerPartService: BoilerPartsService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          useClass: SequelizeConfigService,
        }),
        ConfigModule.forRoot({ load: [databaseConfig] }),
        BoilerPartsModule,
      ],
    }).compile();

    boilerPartService = testModule.get<BoilerPartsService>(BoilerPartsService);

    app = testModule.createNestApplication();

    await app.init();
  });

  it('should find by id', async () => {
    const part = await boilerPartService.findOne(1);

    expect(part.dataValues).toEqual({
      id: 1,
      price: expect.any(Number),
      boiler_manufacturer: expect.any(String),
      parts_manufacturer: expect.any(String),
      vendor_code: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      images: expect.any(String),
      in_stock: expect.any(Number),
      bestseller: expect.any(Boolean),
      new: expect.any(Boolean),
      popularity: expect.any(Number),
      compatibility: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('should find by name', async () => {
    const part = await boilerPartService.findOneByName('Delinquo astrum.');

    expect(part.dataValues).toEqual({
      id: expect.any(Number),
      price: expect.any(Number),
      boiler_manufacturer: expect.any(String),
      parts_manufacturer: expect.any(String),
      vendor_code: expect.any(String),
      name: 'Delinquo astrum.',
      description: expect.any(String),
      images: expect.any(String),
      in_stock: expect.any(Number),
      bestseller: expect.any(Boolean),
      new: expect.any(Boolean),
      popularity: expect.any(Number),
      compatibility: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('should search by str', async () => {
    const parts = await boilerPartService.searchByString('s');

    expect(parts.rows.length).toBeLessThanOrEqual(20);

    parts.rows.forEach((element) => {
      expect(element.name.toLowerCase()).toContain('s'),
        expect(element.dataValues).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            price: expect.any(Number),
            boiler_manufacturer: expect.any(String),
            parts_manufacturer: expect.any(String),
            vendor_code: expect.any(String),
            name: expect.any(String),
            description: expect.any(String),
            images: expect.any(String),
            in_stock: expect.any(Number),
            bestseller: expect.any(Boolean),
            new: expect.any(Boolean),
            popularity: expect.any(Number),
            compatibility: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        );
    });
  });

  it('should get bestsellers', async () => {
    const parts = await boilerPartService.bestseller();

    parts.rows.forEach((element) => {
      expect(element.dataValues).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          price: expect.any(Number),
          boiler_manufacturer: expect.any(String),
          parts_manufacturer: expect.any(String),
          vendor_code: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          images: expect.any(String),
          in_stock: expect.any(Number),
          bestseller: true,
          new: expect.any(Boolean),
          popularity: expect.any(Number),
          compatibility: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  it('should get new parts', async () => {
    const parts = await boilerPartService.new();

    parts.rows.forEach((element) => {
      expect(element.dataValues).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          price: expect.any(Number),
          boiler_manufacturer: expect.any(String),
          parts_manufacturer: expect.any(String),
          vendor_code: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          images: expect.any(String),
          in_stock: expect.any(Number),
          bestseller: expect.any(Boolean),
          new: true,
          popularity: expect.any(Number),
          compatibility: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });
  });
});
