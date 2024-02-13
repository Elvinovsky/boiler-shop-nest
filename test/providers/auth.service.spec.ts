import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { SequelizeConfigService } from '../../src/config/SequelizeConfig.service';
import { databaseConfig } from '../../src/config/configuration';
import { User } from '../../src/users/users.model';
import * as bcrypt from 'bcrypt';
import { AuthModule } from '../../src/auth/auth.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { AuthService } from '../../src/auth/auth.service';

const mockUser = {
  username: 'mockName',
  password: 'mockPassword',
  email: 'mock@mail.ru',
};

describe('Auth service', () => {
  let app: INestApplication;
  let authService: AuthService;

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

    authService = testModule.get<AuthService>(AuthService);

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
    const user = await authService.validateUser(
      mockUser.username,
      mockUser.password,
    );
    expect(user.username).toBe(mockUser.username);
    expect(user.email).toBe(mockUser.email);
  });
});
