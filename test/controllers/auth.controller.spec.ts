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

  it('should login user', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    expect(login.body.user.username).toBe(mockUser.username);
    expect(login.body.user.email).toBe(mockUser.email);
    expect(login.body.user.userId).toEqual(expect.any(Number));
    expect(login.body.msg).toBe('Logged in');
  });

  it('should login check', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockUser.username, password: mockUser.password });

    const loginCheck = await request(app.getHttpServer())
      .get('/users/login-check')
      .set('Cookie', login.headers['set-cookie']);

    expect(loginCheck.body.username).toBe(mockUser.username);
    expect(loginCheck.body.email).toBe(mockUser.email);
  });

  it('should logout', async () => {
    const response = await request(app.getHttpServer()).get('/users/logout');

    expect(response.body.msg).toBe('Session has ended');
  });

  afterAll(async () => {
    await User.truncate();
  });
});
