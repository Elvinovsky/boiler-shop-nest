import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { SequelizeConfigService } from '../../src/config/SequelizeConfig.service';
import { databaseConfig } from '../../src/config/configuration';
import { User } from '../../src/users/users.model';
import * as bcrypt from 'bcrypt';
import { BoilerPartsModule } from '../../src/boiler-parts/boiler-parts.module';
import { BoilerPartsService } from '../../src/boiler-parts/boiler-parts.service';
import { ShoppingCartModule } from '../../src/shopping-cart/shopping-cart.module';
import { UsersModule } from '../../src/users/users.module';
import { ShoppingCart } from '../../src/shopping-cart/shopping-cart.model';
import { UsersService } from '../../src/users/users.service';
import { ShoppingCartService } from '../../src/shopping-cart/shopping-cart.service';

const mockUser = {
  username: 'mockName',
  password: 'mockPassword',
  email: 'mock@mail.ru',
};

describe('Shopping-carts service', () => {
  let app: INestApplication;
  let boilerPartsService: BoilerPartsService;
  let usersService: UsersService;
  let shoppingCartService: ShoppingCartService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          useClass: SequelizeConfigService,
        }),
        ConfigModule.forRoot({ load: [databaseConfig] }),
        BoilerPartsModule,
        UsersModule,
        ShoppingCartModule,
      ],
    }).compile();

    boilerPartsService = testModule.get<BoilerPartsService>(BoilerPartsService);

    usersService = testModule.get<UsersService>(UsersService);

    shoppingCartService =
      testModule.get<ShoppingCartService>(ShoppingCartService);

    app = testModule.createNestApplication();

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

  beforeEach(async () => {
    const cart = new ShoppingCart();

    const user = await usersService.findOne({
      where: { username: mockUser.username },
    });

    const part = await boilerPartsService.findOne(1);

    cart.userId = user.id;
    cart.partId = part.id;
    cart.boiler_manufacturer = part.boiler_manufacturer;
    cart.parts_manufacturer = part.parts_manufacturer;
    cart.price = part.price;
    cart.in_stock = part.in_stock;
    cart.image = JSON.parse(part.images)[0];
    cart.name = part.name;
    cart.total_price = part.price;

    return cart.save();
  });

  afterEach(async () => {
    await User.destroy({ where: { username: mockUser.username } });
    await ShoppingCart.destroy({ where: { partId: 1 } });
  });

  it('should add cart', async () => {
    const user = await usersService.findOne({
      where: { username: mockUser.username },
    });

    const carts = await shoppingCartService.findAll(user.id);

    carts.forEach((cart) =>
      expect(cart.dataValues).toEqual(
        expect.objectContaining({
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
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      ),
    );
  });

  it('should get all carts', async () => {
    const user = await usersService.findOne({
      where: { username: mockUser.username },
    });

    const createCart = await shoppingCartService.add({
      username: user.username,
      partId: 3,
    });

    const carts = await shoppingCartService.findAll(user.id);

    expect(carts.find((item) => item.partId === 3)).toEqual(
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
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should get updated total price of cart item', async () => {
    const part = await boilerPartsService.findOne(1);

    const updateTotalPrice = await shoppingCartService.updateTotalPrice(
      part.price * 3,
      part.id,
    );

    expect(updateTotalPrice).toEqual({ total_price: part.price * 3 });
  });

  it('should delete cart item', async () => {
    await shoppingCartService.remove(1);

    const user = await usersService.findOne({
      where: { username: mockUser.username },
    });

    const getCart = await shoppingCartService.findAll(user.id);

    expect(getCart.find((item) => item.partId === 1)).toBeUndefined();
  });

  it('should delete all cart item', async () => {
    const user = await usersService.findOne({
      where: { username: mockUser.username },
    });

    await shoppingCartService.removeAll(user.id);

    const getCartUser = await shoppingCartService.findAll(user.id);
    expect(getCartUser).toEqual([]);
  });

  afterAll(async () => {
    await ShoppingCart.truncate();
  });
});
