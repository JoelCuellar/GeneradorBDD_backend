import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './shared/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Generador BDD API')
    .setDescription('Endpoints del backend (usuarios, proyectos, etc.)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/json',
    swaggerOptions: { persistAuthorization: true },
  });

  // Cierre limpio Prisma
  const prisma = app.get(PrismaService);
  prisma.enableShutdownHooks(app);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 API: http://localhost:${port}`);
  console.log(`📚 Swagger: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('Error al iniciar la app:', err);
  process.exit(1);
});
