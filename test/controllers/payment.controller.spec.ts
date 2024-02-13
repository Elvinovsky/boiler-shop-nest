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
import { PaymentModule } from '../../src/payment/payment.module';

const mockUser = {
  username: 'mockName',
  password: 'mockPassword',
  email: 'mock@mail.ru',
};

const mockPay = {
  status: 'pending',
  amount: {
    value: '100.00',
    currency: 'RUB',
  },
};

describe('Payment controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          useClass: SequelizeConfigService,
        }),
        ConfigModule.forRoot({ load: [databaseConfig] }),
        PaymentModule,
        AuthModule,
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

  it('should make payment', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    const response = await request(app.getHttpServer())
      .post('/payment')
      .send({ amount: 100 })
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body.status).toEqual(mockPay.status);
    expect(response.body.amount).toEqual(mockPay.amount);
  });

  afterAll(async () => {
    await User.truncate();
  });
});
