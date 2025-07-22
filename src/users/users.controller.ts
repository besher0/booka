/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthRolesGuard } from './guards/auth-roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JWTPayloadType } from 'src/utils/types';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from '../utils/enum/enums';
import { UpdateUserDto } from './dtos/update.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST: ~/api/users/auth/register
  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiBody({ type: RegisterDto })
  public register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }

  // POST: ~/api/users/auth/login
  @Post('auth/login')
  @ApiOperation({ summary: 'Login user and return access token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  public login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  // GET: ~/api/users/current-user
  @Get('current-user')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user fetched successfully' })
  @ApiBearerAuth("access-token")
  @UseGuards(AuthGuard)
  public getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }

  // GET: ~/api/users
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users returned' })
  @ApiBearerAuth("access-token")
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getAllUsers() {
    return this.usersService.getAll();
  }

  // PUT: ~/api/users
  @Put()
  @ApiOperation({ summary: 'Update user data (Admin or user)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiBearerAuth("access-token")
  @ApiBody({ type: UpdateUserDto })
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public updateUser(
    @CurrentUser() payload: JWTPayloadType,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(payload.id, body);
  }

  // DELETE: ~/api/users/:id
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID (Admin or owner)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiBearerAuth("access-token")
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.usersService.delete(id, payload);
  }
}
