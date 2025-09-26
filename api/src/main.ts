import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug'],
  });

  // Enable CORS for frontend connection
  app.enableCors({
    origin: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
