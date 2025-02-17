import { Module } from '@nestjs/common';
import { CriticalEventsService } from './critical-events.service';
import { CriticalEventsController } from './critical-events.controller';

@Module({
  controllers: [CriticalEventsController],
  providers: [CriticalEventsService],
})
export class CriticalEventsModule {}
