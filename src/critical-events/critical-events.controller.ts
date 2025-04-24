import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CriticalEventsService } from './critical-events.service';
import { FindCriticalEventsDto } from './dto/find-critical-events.dto';
import { DaysList } from './entities/critical-event.entity';

@ApiTags('critical-events')
@Controller('critical-events')
export class CriticalEventsController {
  constructor(private readonly criticalEventsService: CriticalEventsService) {}

  @Post('')
  @ApiOperation({ summary: 'Find Critical Events' })
  @ApiResponse({
    status: 200,
    description: 'List of critical events found',
    schema: {
      example: {
        events: ['Event1'],
        status: 200,
        message: 'Critical events found',
      },
    },
  })
  async findCriticalEvents(
    @Body() findCriticalEventsDto: FindCriticalEventsDto,
  ) {
    const transformedData: DaysList = this.criticalEventsService.transformInput(
      findCriticalEventsDto,
    );
    return this.criticalEventsService.findCriticalEvents(transformedData);
  }
}
