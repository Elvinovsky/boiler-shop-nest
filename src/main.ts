import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.use(
    session({
      secret: 'yourSecret',
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true },
      proxy: true,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.enableCors({
    credentials: true,
    origin: [
      'https://boiler-shop-client-one.vercel.app',
      'https://boiler-shop-client-git-main-elvinovsky.vercel.app',
      'https://boiler-shop-client-production.up.railway.app',
      'http://localhost:3001',
    ],
  });

  const config = new DocumentBuilder()
    .setTitle('магазин котлов')
    .setDescription('api documentation')
    .setVersion('1.0')
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port, '0.0.0.0');
  console.log('app started');
}
bootstrap();
