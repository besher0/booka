/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param, Delete, UseGuards, HttpCode, HttpStatus, ForbiddenException, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/dto.create.order';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { UserType } from '../utils/enum/enums';
import { ParseIntPipe } from '@nestjs/common';
import { OrderStatus } from '../utils/enum/order-status.enum';

// Swagger imports
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an order from user cart' })
  @ApiResponse({ status: 201, description: 'Order successfully created.' })
  @ApiBody({ type: CreateOrderDto })
  async createOrder(
    @CurrentUser() user: User,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrderFromCart(user.id, createOrderDto.cafeId, createOrderDto);
  }

  @UseGuards(AuthGuard)
  @Get('all')
              @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all orders.' })
  @ApiResponse({ status: 403, description: 'Only administrators can view all orders.' })
  async findAllOrders(@CurrentUser() user: User) {
    if (user.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only administrators can view all orders.');
    }
    return this.orderService.findAllOrders();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
              @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get order by ID (owner or admin)' })
  @ApiResponse({ status: 200, description: 'Order found.' })
  @ApiResponse({ status: 403, description: 'Not authorized to view this order.' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  async findOneOrder(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    const order = await this.orderService.findOneOrder(id);
    if (order.user.id !== user.id && user.userType !== UserType.ADMIN) {
      throw new ForbiddenException('You are not authorized to view this order.');
    }
    return order;
  }

  @UseGuards(AuthGuard)
  @Put(':id/status/:newStatus')
              @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order status (admin or cafe owner)' })
  @ApiResponse({ status: 200, description: 'Order status updated.' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiParam({ name: 'newStatus', enum: OrderStatus, description: 'New order status' })
  async updateOrderStatus(
    @Param('id', ParseIntPipe) orderId: number,
    @Param('newStatus') newStatus: OrderStatus,
    @CurrentUser() user: User,
  ) {
    return this.orderService.updateOrderStatus(orderId, user.id, newStatus);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
              @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an order (admin only)' })
  @ApiResponse({ status: 204, description: 'Order deleted.' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  async deleteOrder(@Param('id', ParseIntPipe) orderId: number, @CurrentUser() user: User) {
    return this.orderService.deleteOrder(orderId, user.id);
  }

  @UseGuards(AuthGuard)
  @Get('user/:userId')
              @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get all orders by a specific user (user or admin)' })
  @ApiResponse({ status: 200, description: 'List of user orders.' })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  async findUserOrders(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    return this.orderService.findUserOrders(userId, user.id, user.userType);
  }

  @UseGuards(AuthGuard)
  @Get('cafe/:cafeId')
              @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get all orders for a cafe (admin or cafe owner)' })
  @ApiResponse({ status: 200, description: 'List of cafe orders.' })
  @ApiParam({ name: 'cafeId', type: Number, description: 'Cafe ID' })
  async findCafeOrders(
    @Param('cafeId', ParseIntPipe) cafeId: number,
    @CurrentUser() user: User,
  ) {
    return this.orderService.findCafeOrders(cafeId, user.id, user.userType);
  }
}
