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
import { BoilerPartsService } from '../../src/boiler-parts/boiler-parts.service';
import { ShoppingCartModule } from '../../src/shopping-cart/shopping-cart.module';
import { UsersModule } from '../../src/users/users.module';
import { ShoppingCart } from '../../src/shopping-cart/shopping-cart.model';
import { UsersService } from '../../src/users/users.service';

const mockUser = {
  username: 'mockName',
  password: 'mockPassword',
  email: 'mock@mail.ru',
};

describe('Shopping-carts controller', () => {
  let app: INestApplication;
  let boilerPartsService: BoilerPartsService;
  let usersService: UsersService;
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
        UsersModule,
        ShoppingCartModule,
      ],
    }).compile();

    boilerPartsService = testModule.get<BoilerPartsService>(BoilerPartsService);
    usersService = testModule.get<UsersService>(UsersService);

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

    await user.save();

    const cart = new ShoppingCart();

    const savedUser = await User.findOne({
      where: { username: mockUser.username },
    });
    const part = await boilerPartsService.findOne(1);

    cart.userId = savedUser.id;
    cart.partId = part.id;
    cart.boiler_manufacturer = part.boiler_manufacturer;
    cart.parts_manufacturer = part.parts_manufacturer;
    cart.price = part.price;
    cart.in_stock = part.in_stock;
    cart.image = JSON.parse(part.images)[0];
    cart.name = part.name;
    cart.total_price = part.price;

    await cart.save();
  });

  it('should add cart', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    const user = await usersService.findOne({
      where: { username: mockUser.username },
    });

    const response = await request(app.getHttpServer())
      .get(`/shopping-cart/${user.id}`)
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          price: expect.any(Number),
          boiler_manufacturer: expect.any(String),
          parts_manufacturer: expect.any(String),
          name: expect.any(String),
          partId: expect.any(Number),
          userId: user.id,
          count: expect.any(Number),
          total_price: expect.any(Number),
          image: expect.any(String),
          in_stock: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]),
    );
  });

  it('should get all carts', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    await request(app.getHttpServer())
      .post('/shopping-cart/add')
      .send({ username: mockUser.username, partId: 3 })
      .set('Cookie', login.headers['set-cookie']);

    const user = await usersService.findOne({
      where: { username: mockUser.username },
    });

    const carts = await request(app.getHttpServer())
      .get(`/shopping-cart/${user.id}`)
      .set('Cookie', login.headers['set-cookie']);

    expect(carts.body.find((item) => item.partId === 3)).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        price: expect.any(Number),
        boiler_manufacturer: expect.any(String),
        parts_manufacturer: expect.any(String),
        name: expect.any(String),
        partId: 3,
        userId: user.id,
        count: expect.any(Number),
        total_price: expect.any(Number),
        image: expect.any(String),
        in_stock: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it('should get updated total price of cart item', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    const part = await boilerPartsService.findOne(1);

    const response = await request(app.getHttpServer())
      .put(`/shopping-cart/total-price/${part.id}`)
      .send({ total_price: part.price * 3 })
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body).toEqual({ total_price: part.price * 3 });
  });

  it('should delete cart item', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    await request(app.getHttpServer())
      .delete('/shopping-cart/one/1')
      .set('Cookie', login.headers['set-cookie']);

    const user = await usersService.findOne({
      where: { username: mockUser.username },
    });

    const response = await request(app.getHttpServer())
      .get(`/shopping-cart/${user.id}`)
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body.find((item) => item.partId === 1)).toBeUndefined();
  });

  it('should delete all cart item', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    const user = await usersService.findOne({
      where: { username: mockUser.username },
    });

    await request(app.getHttpServer())
      .delete(`/shopping-cart/all/${user.id}`)
      .set('Cookie', login.headers['set-cookie']);

    await request(app.getHttpServer())
      .get(`/shopping-cart/${user.id}`)
      .set('Cookie', login.headers['set-cookie'])
      .expect(200, []);
  });

  afterEach(async () => {
    await User.destroy({ where: { username: mockUser.username } });
    await ShoppingCart.destroy({ where: { partId: 1 } });
  });

  afterAll(async () => {
    await ShoppingCart.truncate();
    await User.truncate();
  });
});
