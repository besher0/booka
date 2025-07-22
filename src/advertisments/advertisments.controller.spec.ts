import { Test, TestingModule } from '@nestjs/testing';
import { AdvertismentsController } from './advertisments.controller';

describe('AdvertismentsController', () => {
  let controller: AdvertismentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvertismentsController],
    }).compile();

    controller = module.get<AdvertismentsController>(AdvertismentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
