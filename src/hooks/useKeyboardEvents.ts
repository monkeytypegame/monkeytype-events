import { useCallback, useRef, useState } from "react";
import type {
  EventData,
  EventFilters,
  KeyboardEventData,
  InputEventData,
  CompositionEventData,
} from "../types/events";
import { MAX_EVENTS } from "../types/events";

export function useKeyboardEvents() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [filters, setFilters] = useState<EventFilters>({
    keydown: true,
    keyup: true,
    keypress: true,
    input: true,
    beforeinput: true,
    compositionstart: true,
    compositionupdate: true,
    compositionend: true,
  });

  const eventIdRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const keydownTimestamps = useRef<Record<string, number>>({});

  const createEventData = useCallback(
    (
      event: KeyboardEvent | InputEvent | CompositionEvent,
      textareaValue: string
    ): EventData => {
      const currentTime = performance.now();
      // Initialize start time on first event if not set
      if (startTimeRef.current === 0) {
        startTimeRef.current = currentTime;
      }
      const timestamp = currentTime - startTimeRef.current;
      const baseData = {
        id: eventIdRef.current++,
        timestamp,
        eventType: event.type,
        textareaValue,
      };

      switch (event.type) {
        case "keydown":
        case "keyup":
        case "keypress": {
          const kbEvent = event as KeyboardEvent;
          const baseKbData = {
            ...baseData,
            eventType: event.type as "keydown" | "keyup" | "keypress",
            key: kbEvent.key,
            code: kbEvent.code,
            keyCode: kbEvent.keyCode,
            charCode: kbEvent.charCode || 0,
            ctrlKey: kbEvent.ctrlKey,
            shiftKey: kbEvent.shiftKey,
            altKey: kbEvent.altKey,
            metaKey: kbEvent.metaKey,
            location: kbEvent.location,
          };

          if (event.type === "keydown") {
            // Store the timestamp for this key code
            keydownTimestamps.current[kbEvent.code] = currentTime;
            return baseKbData as KeyboardEventData;
          } else if (event.type === "keyup") {
            // Calculate duration if we have a keydown timestamp
            const keydownTime = keydownTimestamps.current[kbEvent.code];
            let duration: number | undefined;
            if (keydownTime !== undefined) {
              duration = currentTime - keydownTime;
              // Clean up the stored timestamp
              delete keydownTimestamps.current[kbEvent.code];
            }
            return {
              ...baseKbData,
              duration,
            } as KeyboardEventData;
          } else {
            return baseKbData as KeyboardEventData;
          }
        }

        case "input":
        case "beforeinput": {
          const inputEvent = event as InputEvent;
          return {
            ...baseData,
            eventType: event.type as "input" | "beforeinput",
            inputType: inputEvent.inputType || "",
            data: inputEvent.data,
            isComposing: inputEvent.isComposing,
          } as InputEventData;
        }

        case "compositionstart":
        case "compositionupdate":
        case "compositionend": {
          const compEvent = event as CompositionEvent;
          return {
            ...baseData,
            eventType: event.type as
              | "compositionstart"
              | "compositionupdate"
              | "compositionend",
            data: compEvent.data,
            locale: undefined, // Not available in standard CompositionEvent
          } as CompositionEventData;
        }

        default:
          throw new Error(`Unsupported event type: ${event.type}`);
      }
    },
    []
  );

  const addEvent = useCallback((eventData: EventData) => {
    setEvents((prevEvents) => {
      // Add the new event at the beginning (newest first)
      const newEvents = [eventData, ...prevEvents];

      // Keep only the most recent MAX_EVENTS
      const trimmedEvents = newEvents.slice(0, MAX_EVENTS);

      return trimmedEvents;
    });
  }, []);

  const createEventHandler = useCallback(() => {
    return (event: Event) => {
      // Ignore repeat keyboard events
      if (event instanceof KeyboardEvent && event.repeat) {
        return;
      }

      // Ignore all escape key events
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        return;
      }

      // Always capture events regardless of filter settings
      // Filters only control display, not capture
      const target = event.target as HTMLTextAreaElement;
      const textareaValue = target.value || "";

      try {
        const eventData = createEventData(
          event as KeyboardEvent | InputEvent | CompositionEvent,
          textareaValue
        );
        addEvent(eventData);
      } catch (error) {
        console.warn("Failed to create event data:", error);
      }
    };
  }, [createEventData, addEvent]);

  const attachEventListeners = useCallback(
    (element: HTMLTextAreaElement) => {
      const eventTypes = [
        "keydown",
        "keyup",
        "keypress",
        "input",
        "beforeinput",
        "compositionstart",
        "compositionupdate",
        "compositionend",
      ];

      const handlers = eventTypes.map((eventType) => {
        const handler = createEventHandler();
        element.addEventListener(eventType, handler, true);
        return { eventType, handler };
      });

      return () => {
        handlers.forEach(({ eventType, handler }) => {
          element.removeEventListener(eventType, handler, true);
        });
      };
    },
    [createEventHandler]
  );

  const clearEvents = useCallback(() => {
    setEvents([]);
    eventIdRef.current = 0;
    startTimeRef.current = 0; // Reset start time so next event will be timestamp 0
    keydownTimestamps.current = {}; // Clear stored keydown timestamps
  }, []);

  const importEvents = useCallback((importedEvents: EventData[]) => {
    setEvents(importedEvents);
    // Reset event ID to the highest ID in imported events + 1
    const maxId = importedEvents.reduce((max, event) => Math.max(max, event.eventId), 0);
    eventIdRef.current = maxId + 1;
    // Reset timestamps - they'll be relative to the imported events
    const firstEvent = importedEvents[0];
    startTimeRef.current = firstEvent ? firstEvent.timestamp - firstEvent.relativeTime : 0;
    keydownTimestamps.current = {};
  }, []);

  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const filteredEvents = events.filter((event) => {
    return filters[event.eventType as keyof EventFilters];
  });

  return {
    events: filteredEvents,
    allEvents: events, // Return all captured events for statistics
    filters,
    attachEventListeners,
    clearEvents,
    importEvents,
    updateFilters,
  };
}
