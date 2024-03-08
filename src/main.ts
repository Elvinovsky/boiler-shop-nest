import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.enableCors({
    credentials: true,
    origin: [
      'https://boiler-shop-client-one.vercel.app',
      'https://boiler-shop-client-git-main-elvinovsky.vercel.app',
      'https://boiler-shop-client-oq4gbpbna-elvinovsky.vercel.app/',
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

  await app.listen(3000);
  console.log('app started');
}
bootstrap();
