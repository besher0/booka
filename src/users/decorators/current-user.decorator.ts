/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CURRENT_USER_KEY } from "src/utils/constants";
import { JWTPayloadType } from "src/utils/types";

// CurrentUser Parameter Decorator
export const CurrentUser = createParamDecorator(
    (data, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        const payload: JWTPayloadType = request[CURRENT_USER_KEY];
        return payload;
    }
)