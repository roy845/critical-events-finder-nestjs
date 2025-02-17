import { Test, TestingModule } from '@nestjs/testing';
import { CriticalEventsController } from './critical-events.controller';
import { CriticalEventsService } from './critical-events.service';

describe('CriticalEventsController', () => {
  let controller: CriticalEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CriticalEventsController],
      providers: [CriticalEventsService],
    }).compile();

    controller = module.get<CriticalEventsController>(CriticalEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
