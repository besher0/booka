/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ShoppingCartService } from './cart.service';
import { AddToCartDto } from './dto/dto.createCart';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ParseIntPipe } from '@nestjs/common';
import { ShoppingCart } from './cart.entity';
import { CartItem } from './cart-item.entity';

// Swagger imports
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Shopping Cart')
@ApiBearerAuth()
@Controller('cart')
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  @UseGuards(AuthGuard)
  @Get()
            @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get current user\'s shopping cart or create one if not exists' })
  @ApiResponse({ status: 200, description: 'User\'s shopping cart returned.', type: ShoppingCart })
  async getMyCart(@CurrentUser() user: User): Promise<ShoppingCart> {
    return this.shoppingCartService.getOrCreateCart(user.id);
  }

  @UseGuards(AuthGuard)
  @Post('items')
            @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Add product to cart or update quantity if already exists' })
  @ApiResponse({ status: 201, description: 'Cart item added or updated.' })
  @ApiBody({ type: AddToCartDto })
  async addOrUpdateCartItem(
    @CurrentUser() user: User,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.shoppingCartService.addOrUpdateItem(user.id, addToCartDto);
  }

  @UseGuards(AuthGuard)
  @Put('items/:cartItemId')
            @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Update quantity of a specific cart item' })
  @ApiResponse({ status: 200, description: 'Cart item quantity updated.', type: CartItem })
  @ApiParam({ name: 'cartItemId', type: Number, description: 'ID of the cart item to update' })
  @ApiBody({ type: UpdateCartItemDto })
  async updateCartItem(
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @CurrentUser() user: User,
    @Body() updateDto: UpdateCartItemDto,
  ): Promise<CartItem | void> {
    return this.shoppingCartService.updateItemQuantity(cartItemId, user.id, updateDto);
  }

  @UseGuards(AuthGuard)
  @Delete('items/:cartItemId')
            @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a specific item from the cart' })
  @ApiResponse({ status: 204, description: 'Cart item removed.' })
  @ApiParam({ name: 'cartItemId', type: Number, description: 'ID of the cart item to remove' })
  async removeCartItem(
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.shoppingCartService.removeCartItem(cartItemId, user.id);
  }

  @UseGuards(AuthGuard)
  @Delete('clear')
            @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all items from the current user\'s cart' })
  @ApiResponse({ status: 204, description: 'Shopping cart cleared.' })
  async clearMyCart(@CurrentUser() user: User): Promise<void> {
    return this.shoppingCartService.clearCart(user.id);
  }

  @UseGuards(AuthGuard)
  @Get('totals')
            @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Calculate total amount and number of items in cart' })
  @ApiResponse({ 
    status: 200, 
    description: 'Totals calculated.',
    schema: {
      example: { totalAmount: 150, totalItems: 5 }
    }
  })
  async getCartTotals(@CurrentUser() user: User): Promise<{ totalAmount: number, totalItems: number }> {
    return this.shoppingCartService.calculateCartTotals(user.id);
  }
}
