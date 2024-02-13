import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { SequelizeConfigService } from '../../src/config/SequelizeConfig.service';
import { databaseConfig } from '../../src/config/configuration';
import { UsersModule } from '../../src/users/users.module';
import { User } from '../../src/users/users.model';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

describe('Users controller', () => {
  let app: INestApplication;

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

    const response = await request(app.getHttpServer())
      .post('/users/signup')
      .send(newUser);

    const passwordIsValid = await bcrypt.compare(
      newUser.password,
      response.body.password,
    );

    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.username).toBe(newUser.username);
    expect(response.body.email).toBe(newUser.email);
    expect(passwordIsValid).toBe(true);
    expect(response.body.updatedAt).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
  });

  afterAll(async () => {
    await User.truncate();
  });
});
