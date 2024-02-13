import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { SequelizeConfigService } from '../../src/config/SequelizeConfig.service';
import { databaseConfig } from '../../src/config/configuration';
import { UsersModule } from '../../src/users/users.module';
import { User } from '../../src/users/users.model';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../src/users/users.service';

describe('Users service', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          useClass: SequelizeConfigService,
        }),
        ConfigModule.forRoot({ load: [databaseConfig] }),
        UsersModule,
      ],
    }).compile();

    usersService = testModule.get<UsersService>(UsersService);

    app = testModule.createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    await User.destroy({ where: { username: 'test' } });
  });

  it('should created user', async () => {
    const newUser = {
      username: 'test',
      password: 'test123',
      email: 'test@mail.ru',
    };

    const user = (await usersService.create(newUser)) as User;

    const passwordIsValid = await bcrypt.compare(
      newUser.password,
      user.password,
    );

    expect(user.username).toBe(newUser.username);
    expect(user.email).toBe(newUser.email);
    expect(passwordIsValid).toBe(true);
  });
});
