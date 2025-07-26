import { Test, TestingModule } from '@nestjs/testing';
import { TableBookingService } from './table-booking.service';

describe('TableBookingService', () => {
  let service: TableBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TableBookingService],
    }).compile();

    service = module.get<TableBookingService>(TableBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
