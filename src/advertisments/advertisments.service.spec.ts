import { Test, TestingModule } from '@nestjs/testing';
import { AdvertismentsService } from './advertisments.service';

describe('AdvertismentsService', () => {
  let service: AdvertismentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdvertismentsService],
    }).compile();

    service = module.get<AdvertismentsService>(AdvertismentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
