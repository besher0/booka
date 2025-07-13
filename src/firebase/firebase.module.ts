/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/firebase/firebase.module.ts
import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        const serviceAccountKey = configService.get<string>('FIREBASE_SERVICE_ACCOUNT_KEY');
        if (!serviceAccountKey) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not defined in environment variables.');
        }

        const serviceAccount = JSON.parse(serviceAccountKey);

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }

        return admin.messaging(); // ✅ هذا هو التعديل المهم
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
