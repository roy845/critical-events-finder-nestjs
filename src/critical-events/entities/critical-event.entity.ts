type IntersectionEvent = [string, string];
type DaysList = IntersectionEvent[][];
type EventIntersections = Record<string, Set<string>>;
type EventDaysCount = Record<string, number>;

export { IntersectionEvent, DaysList, EventIntersections, EventDaysCount };
