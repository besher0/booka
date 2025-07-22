/* eslint-disable prettier/prettier */
// src/shopping-cart/shopping-cart.service.ts
import { Injectable, NotFoundException, BadRequestException,  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingCart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { AddToCartDto } from './dto/dto.createCart';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class ShoppingCartService {
  constructor(
      @InjectRepository(ShoppingCart)
  private shoppingCartRepository: Repository<ShoppingCart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // **1. جلب سلة المشتريات للمستخدم (أو إنشائها إذا لم تكن موجودة)**
  async getOrCreateCart(userId: number): Promise<ShoppingCart> {
 const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['shoppingCart'] });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    let shoppingCart = await this.shoppingCartRepository.findOne({ where: { user: { id: userId } }, relations: ['cartItems', 'cartItems.product'] });

    if (!shoppingCart) {
      shoppingCart = this.shoppingCartRepository.create({ user: user });
      await this.shoppingCartRepository.save(shoppingCart);
    }
    return shoppingCart;
  }

  // **2. إضافة منتج إلى السلة أو تحديث كميته**
  async addOrUpdateItem(userId: number, addToCartDto: AddToCartDto){
    const { productId, quantity } = addToCartDto;

    const shoppingCart = await this.getOrCreateCart(userId);
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: { shoppingCart: { id: shoppingCart.id }, product: { id: productId } },
    });

    if (cartItem) {
      // تحديث الكمية
      cartItem.quantity += quantity;
      // إذا أصبحت الكمية صفر أو أقل، يمكن حذف العنصر
      if (cartItem.quantity <= 0) {
        await this.cartItemRepository.remove(cartItem);
        return null; // أو إرجاع رسالة مناسبة
      }
    } else {
      // إضافة عنصر جديد
      if (quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0 to add a new item to cart.');
      }
      cartItem = this.cartItemRepository.create({
        shoppingCart: shoppingCart,
        product: product,
        quantity: quantity,
        priceAtAddition: product.price, // تسجيل السعر الحالي للمنتج
      });
    }

    return this.cartItemRepository.save(cartItem);
  }

  // **3. تحديث كمية عنصر معين في السلة (بواسطة معرف عنصر السلة)**
  async updateItemQuantity(cartItemId: number, userId: number, updateDto: UpdateCartItemDto): Promise<CartItem | void> {
    const shoppingCart = await this.getOrCreateCart(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, shoppingCart: { id: shoppingCart.id } },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found in your cart.`);
    }

    if (updateDto.quantity <= 0) {
      await this.cartItemRepository.remove(cartItem);
      return; // العنصر تم حذفه
    }

    cartItem.quantity = updateDto.quantity;
    return this.cartItemRepository.save(cartItem);
  }

  // **4. حذف عنصر معين من السلة**
  async removeCartItem(cartItemId: number, userId: number): Promise<void> {
    const shoppingCart = await this.getOrCreateCart(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, shoppingCart: { id: shoppingCart.id } },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found in your cart.`);
    }

    await this.cartItemRepository.remove(cartItem);
  }

  // **5. مسح السلة بالكامل**
  async clearCart(userId: number): Promise<void> {
    const shoppingCart = await this.getOrCreateCart(userId);
    const cartItems = await this.cartItemRepository.find({ where: { shoppingCart: { id: shoppingCart.id } } });
    if (cartItems.length > 0) {
      await this.cartItemRepository.remove(cartItems);
    }
  }

  // **6. حساب إجمالي السلة**
  async calculateCartTotals(userId: number): Promise<{ totalAmount: number, totalItems: number }> {
    const shoppingCart = await this.getOrCreateCart(userId);
    const cartItems = await this.cartItemRepository.find({ where: { shoppingCart: { id: shoppingCart.id } }, relations: ['product'] });

    let totalAmount = 0;
    let totalItems = 0;

    cartItems.forEach(item => {
      totalAmount += item.quantity * item.product.price; // استخدم سعر المنتج الحالي أو priceAtAddition
      totalItems += item.quantity;
    });

    return { totalAmount, totalItems };
  }
}