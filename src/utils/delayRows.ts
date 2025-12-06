import type { EventData, DelayRow, EventTableRow } from "../types/events";

const DELAY_THRESHOLD = 50; // milliseconds

let delayRowId = 1000000; // Start with high ID to avoid conflicts

export function addDelayRowsToEvents(events: EventData[]): EventTableRow[] {
  if (events.length === 0) return [];

  const eventsWithDelays: EventTableRow[] = [];

  for (let i = 0; i < events.length; i++) {
    const currentEvent = events[i];

    // Add delay row if there's a significant gap from the previous event
    if (i > 0) {
      const previousEvent = events[i - 1];
      const timeDifference = previousEvent.timestamp - currentEvent.timestamp;

      if (timeDifference > DELAY_THRESHOLD) {
        const delayRow: DelayRow = {
          id: delayRowId++,
          isDelayRow: true,
          delay: timeDifference,
          timestamp: currentEvent.timestamp,
        };
        eventsWithDelays.push(delayRow);
      }
    }

    // Add the actual event
    eventsWithDelays.push(currentEvent);
  }

  return eventsWithDelays;
}
