/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */


import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { JWTPayloadType } from "src/utils/types";
import { Request } from "express";
import { CURRENT_USER_KEY } from "src/utils/constants";

 @Injectable()
 export class AuthGuard implements CanActivate{
    constructor(
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService
    ){}

    async canActivate(context: ExecutionContext) {
        const request:Request=context.switchToHttp().getRequest()
        const [type,token]=request.headers.authorization?.split(" ") ?? []
        if(token&&type==="Bearer")
            try {
                const payload:JWTPayloadType=await this.jwtService.verifyAsync(
                    token,{
                        secret:this.configService.get<string>("JWT_SECRET")
                    }
                )
                request[CURRENT_USER_KEY]=payload
            } catch (error) {
                throw new UnauthorizedException("acess denied,no token provided")
                
            }else{
                return false
            }
            return true;
    }
 }