/* eslint-disable prettier/prettier */
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // **استيراد جديد**
import { ValidationPipe } from '@nestjs/common'; // **لضمان عمل الـ DTOs بشكل صحيح**

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // **تأكد من تفعيل ValidationPipe لاستخدام DTOs مع Swagger**
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // يزيل أي خصائص غير معرفة في الـ DTO
    forbidNonWhitelisted: true, // يلقي خطأ إذا كانت هناك خصائص غير معرفة
    transform: true, // يحول الـ payload إلى أنواع الـ DTO تلقائياً
  }));

app.enableCors({
      origin: true, // للسماح بأي أصل (للتطوير فقط، في الإنتاج حدد الأصول المسموح بها)
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true, // إذا كنت ترسل الكوكيز أو Authentication headers
  });

  // **تهيئة Swagger**
  const config = new DocumentBuilder()
    .setTitle('Booka API Documentation') // عنوان التوثيق
    .setDescription('The Booka API description for managing cafes, products, bookings, and more.') // وصف الـ API
    .setVersion('1.0') // إصدار الـ API
    .addBearerAuth( // إضافة خيار المصادقة بواسطة Bearer Token (JWT)
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token', // اسم الحماية (يمكن أن يكون أي شيء، يُستخدم للإشارة إليه)
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // **http://localhost:3000/api-docs** هو مسار توثيق Swagger

  await app.listen(3000); // المنفذ الذي يعمل عليه تطبيقك
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation is available at: ${await app.getUrl()}/api-docs`);
}
bootstrap();