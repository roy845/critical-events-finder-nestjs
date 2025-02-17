import { Test, TestingModule } from '@nestjs/testing';
import { CriticalEventsService } from './critical-events.service';

describe('CriticalEventsService', () => {
  let service: CriticalEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CriticalEventsService],
    }).compile();

    service = module.get<CriticalEventsService>(CriticalEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
