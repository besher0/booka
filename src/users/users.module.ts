/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthProvider } from "./auth.providers";

@Module({
    controllers: [UsersController],
    providers: [UsersService,AuthProvider],
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    global: true,
                    secret: config.get<string>("JWT_SECRET"),
                    signOptions: { expiresIn: config.get<string>("JWT_EXPIRATION_TIME") }
                }
            }
        })
    ],
     exports: [UsersService,JwtModule],
})
export class UsersModule { }