/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/order/order.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { User } from '../users/user.entity';
import { Cafe } from '../cafe/cafe.entity';
import { ShoppingCartService } from '../cart/cart.service';
import { OrderStatus } from '../utils/enum/order-status.enum';
import { CreateOrderDto } from './dto/dto.create.order';
import { NotificationService } from '../notification/notification.service';
import { UserType } from '../utils/enum/enums';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Cafe)
    private cafeRepository: Repository<Cafe>,
    private shoppingCartService: ShoppingCartService,
    private notificationService: NotificationService,
  ) {}

  async createOrderFromCart(userId: number, cafeId: number, orderDetailsDto: CreateOrderDto): Promise<Order> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found.`);

    const cafe = await this.cafeRepository.findOne({ where: { id: cafeId } });
    if (!cafe) throw new NotFoundException(`Cafe with ID ${cafeId} not found.`);

    const shoppingCart = await this.shoppingCartService.getOrCreateCart(userId);
    if (!shoppingCart.cartItems || shoppingCart.cartItems.length === 0) {
      throw new BadRequestException('لا يمكن إنشاء طلب من سلة فارغة.');
    }

    const { totalAmount } = await this.shoppingCartService.calculateCartTotals(userId);

    const newOrder = this.orderRepository.create({
      user: user,
      cafe: cafe,
      totalAmount: totalAmount,
      discountAmount: orderDetailsDto.discountAmount || 0,
      taxAmount: orderDetailsDto.taxAmount || 0,
      finalAmount: totalAmount - (orderDetailsDto.discountAmount || 0) + (orderDetailsDto.taxAmount || 0),
      deliveryMethod: orderDetailsDto.deliveryMethod,
      numberOfPeople: orderDetailsDto.numberOfPeople,
      notes: orderDetailsDto.notes,
      paymentMethod: orderDetailsDto.paymentMethod,
      paymentDetails: orderDetailsDto.paymentDetails,
      status: OrderStatus.PENDING,
    });
    const savedOrder = await this.orderRepository.save(newOrder);

    const orderItems: OrderItem[] = [];
    for (const cartItem of shoppingCart.cartItems) {
      const orderItem = this.orderItemRepository.create({
        order: savedOrder,
        product: cartItem.product,
        quantity: cartItem.quantity,
        priceAtOrder: cartItem.priceAtAddition,
      });
      orderItems.push(orderItem);
    }
    await this.orderItemRepository.save(orderItems);

    await this.shoppingCartService.clearCart(userId);

    try {
      await this.notificationService.sendToSpecificUsers(
        [userId],
        'تم استلام طلبك!',
        `تم استلام طلبك رقم ${savedOrder.id} من ${savedOrder.cafe.name}. حالة الطلب: ${savedOrder.status}.`,
        { orderId: savedOrder.id.toString(), cafeId: savedOrder.cafe.id.toString(), status: savedOrder.status }
      );
    } catch (notificationError) {
      console.error('فشل في إرسال إشعار تأكيد الطلب:', notificationError);
    }

    return savedOrder;
  }

  async findAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'cafe', 'orderItems', 'orderItems.product'],
    });
  }

  async findOneOrder(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'cafe', 'orderItems', 'orderItems.product'],
    });
    if (!order) {
      throw new NotFoundException(`الطلب بالمعرف ${id} لم يتم العثور عليه.`);
    }
    return order;
  }

  async updateOrderStatus(
    orderId: number,
    adminOrOwnerId: number,
    newStatus: OrderStatus,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'cafe', 'cafe.owner'], // <--- أضف 'cafe.owner' لتحميل علاقة المالك
    });
    if (!order) {
      throw new NotFoundException(`الطلب بالمعرف ${orderId} لم يتم العثور عليه.`);
    }

    const updatingUser = await this.userRepository.findOne({ where: { id: adminOrOwnerId } });
    if (!updatingUser) {
        throw new NotFoundException(`المستخدم الذي يقوم بالتحديث بالمعرف ${adminOrOwnerId} لم يتم العثور عليه.`);
    }

    if (updatingUser.userType !== UserType.ADMIN && order.cafe.owner?.id !== adminOrOwnerId) { // <--- تم التغيير من cafe.user.id إلى cafe.owner?.id
        throw new ForbiddenException('أنت غير مصرح لك بتحديث حالة هذا الطلب.');
    }

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(`لا يمكن تحديث حالة طلب مكتمل أو ملغى.`);
    }
    order.status = newStatus;
    const updatedOrder = await this.orderRepository.save(order);

    try {
      await this.notificationService.sendToSpecificUsers(
        [updatedOrder.user.id],
        `تحديث حالة طلبك رقم ${updatedOrder.id}`,
        `حالة طلبك في ${updatedOrder.cafe.name} تغيرت إلى: ${updatedOrder.status}.`,
        { orderId: updatedOrder.id.toString(), cafeId: updatedOrder.cafe.id.toString(), status: updatedOrder.status }
      );
    } catch (notificationError) {
      console.error('فشل في إرسال إشعار تحديث حالة الطلب:', notificationError);
    }

    return updatedOrder;
  }

  async deleteOrder(orderId: number, adminId: number): Promise<{ message: string }> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`الطلب بالمعرف ${orderId} لم يتم العثور عليه.`);
    }

    const adminUser = await this.userRepository.findOne({ where: { id: adminId } });
    if (!adminUser || adminUser.userType !== UserType.ADMIN) {
        throw new ForbiddenException('فقط المسؤولون مصرح لهم بحذف الطلبات.');
    }

    await this.orderRepository.remove(order);
    return { message: 'تم حذف الطلب بنجاح' };
  }

  async findUserOrders(userId: number, currentUserId: number, currentUserRole: UserType): Promise<Order[]> {
    if (currentUserId !== userId && currentUserRole !== UserType.ADMIN) {
        throw new ForbiddenException('أنت غير مصرح لك بعرض هذه الطلبات.');
    }
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'cafe', 'orderItems', 'orderItems.product'],
    });
  }

  async findCafeOrders(cafeId: number, currentUserId: number, currentUserRole: UserType): Promise<Order[]> {
    const cafe = await this.cafeRepository.findOne({ where: { id: cafeId }, relations: ['owner'] }); // <--- أضف علاقة المالك هنا
    if (!cafe) {
        throw new NotFoundException(`المقهى بالمعرف ${cafeId} لم يتم العثور عليه.`);
    }
    if (currentUserRole !== UserType.ADMIN && cafe.owner?.id !== currentUserId) { // <--- غيّر cafe.user.id إلى cafe.owner?.id
        throw new ForbiddenException('أنت غير مصرح لك بعرض طلبات هذا المقهى.');
    }

    return this.orderRepository.find({
      where: { cafe: { id: cafeId } },
      relations: ['user', 'cafe', 'orderItems', 'orderItems.product'],
    });
  }
}