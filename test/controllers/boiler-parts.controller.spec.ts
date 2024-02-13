import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { SequelizeConfigService } from '../../src/config/SequelizeConfig.service';
import { databaseConfig } from '../../src/config/configuration';
import { User } from '../../src/users/users.model';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { BoilerPartsModule } from '../../src/boiler-parts/boiler-parts.module';

const mockUser = {
  username: 'mockName',
  password: 'mockPassword',
  email: 'mock@mail.ru',
};

describe('Auth controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          useClass: SequelizeConfigService,
        }),
        ConfigModule.forRoot({ load: [databaseConfig] }),
        AuthModule,
        BoilerPartsModule,
      ],
    }).compile();

    app = testModule.createNestApplication();

    app.use(
      session({
        secret: 'yourSecret',
        resave: false,
        saveUninitialized: false,
        cookie: { httpOnly: true },
      }),
    );

    app.use(passport.initialize());

    app.use(passport.session());

    await app.init();
  });

  beforeEach(async () => {
    const user = new User();

    const hashedPassword = await bcrypt.hash(mockUser.password, 12);

    user.username = mockUser.username;
    user.email = mockUser.email;
    user.password = hashedPassword;

    return user.save();
  });

  afterEach(async () => {
    await User.destroy({ where: { username: mockUser.username } });
  });

  it('should get one part', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    const part = await request(app.getHttpServer())
      .get('/boiler-parts/find/1')
      .set('Cookie', login.headers['set-cookie']);

    expect(part.body).toEqual(
      expect.objectContaining({
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
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it('should get bestsellers', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    const parts = await request(app.getHttpServer())
      .get('/boiler-parts/bestsellers')
      .set('Cookie', login.headers['set-cookie']);

    expect(parts.body.rows).toEqual(
      expect.arrayContaining([
        {
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
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]),
    );
  });

  it('should get new parts', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    const parts = await request(app.getHttpServer())
      .get('/boiler-parts/new')
      .set('Cookie', login.headers['set-cookie']);

    expect(parts.body.rows).toEqual(
      expect.arrayContaining([
        {
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
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]),
    );
  });

  it('should search by string', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    const body = { string: 's' };

    const parts = await request(app.getHttpServer())
      .post('/boiler-parts/search')
      .send(body)
      .set('Cookie', login.headers['set-cookie']);

    expect(parts.body.rows.length).toBeLessThanOrEqual(20);

    parts.body.rows.forEach((element) =>
      expect(element.name).toContain(body.string),
    );

    expect(parts.body.rows).toEqual(
      expect.arrayContaining([
        {
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
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]),
    );
  });

  it('should get by name', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    const body = { name: 'Delinquo astrum.' };

    const parts = await request(app.getHttpServer())
      .post('/boiler-parts/name')
      .send(body)
      .set('Cookie', login.headers['set-cookie']);

    expect(parts.body).toEqual({
      id: expect.any(Number),
      price: expect.any(Number),
      boiler_manufacturer: expect.any(String),
      parts_manufacturer: expect.any(String),
      vendor_code: expect.any(String),
      name: body.name,
      description: expect.any(String),
      images: expect.any(String),
      in_stock: expect.any(Number),
      bestseller: expect.any(Boolean),
      new: expect.any(Boolean),
      popularity: expect.any(Number),
      compatibility: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  afterAll(async () => {
    await User.truncate();
  });
});
