import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { FindCriticalEventsDto } from './dto/find-critical-events.dto';
import {
  DaysList,
  EventDaysCount,
  EventIntersections,
} from './entities/critical-event.entity';

@Injectable()
export class CriticalEventsService {
  private static readonly MIN_DAYS: number = 2;
  private static readonly MIN_INTERSECTIONS: number = 2;

  updateEventIntersections(day: [string, string][]): EventIntersections {
    const eventIntersections: EventIntersections = {};
    for (const [intersection, event] of day) {
      if (!eventIntersections[event]) {
        eventIntersections[event] = new Set<string>();
      }
      eventIntersections[event].add(intersection);
    }
    return eventIntersections;
  }

  updateEventDaysCount(
    eventIntersections: EventIntersections,
    eventDaysCount: EventDaysCount,
    criticalEvents: Set<string>,
  ): void {
    for (const [event, intersections] of Object.entries(eventIntersections)) {
      if (intersections.size >= CriticalEventsService.MIN_INTERSECTIONS) {
        eventDaysCount[event] = (eventDaysCount[event] || 0) + 1;

        if (eventDaysCount[event] >= CriticalEventsService.MIN_DAYS) {
          criticalEvents.add(event);
        }
      }
    }
  }

  findCriticalEvents(days_list: DaysList): {
    critical_events: string[];
    status: number;
    message: string;
  } {
    const eventDaysCount: EventDaysCount = {};
    const criticalEvents: Set<string> = new Set();

    for (const day of days_list) {
      const eventIntersections = this.updateEventIntersections(day);
      this.updateEventDaysCount(
        eventIntersections,
        eventDaysCount,
        criticalEvents,
      );
    }

    return {
      critical_events: Array.from(criticalEvents),
      status: HttpStatus.OK,
      message: 'Critical events found',
    };
  }

  transformInput(days_list: FindCriticalEventsDto): DaysList {
    return days_list.days_list.map((day) =>
      day.map((item) => [item.intersection, item.event]),
    );
  }
}
