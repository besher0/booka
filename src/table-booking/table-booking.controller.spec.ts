import { Test, TestingModule } from '@nestjs/testing';
import { TableBookingController } from './table-booking.controller';

describe('TableBookingController', () => {
  let controller: TableBookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableBookingController],
    }).compile();

    controller = module.get<TableBookingController>(TableBookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
