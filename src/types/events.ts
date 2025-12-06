// Event data structure for capturing all keyboard events
export interface BaseEventData {
  id: number;
  timestamp: number; // performance.now()
  eventType: string;
  textareaValue: string;
}

export interface KeyboardEventData extends BaseEventData {
  eventType: "keydown" | "keyup" | "keypress";
  key: string;
  code: string;
  keyCode: number;
  charCode: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  location: number;
  duration?: number; // Duration in milliseconds (only for keyup events)
}

export interface InputEventData extends BaseEventData {
  eventType: "input" | "beforeinput";
  inputType: string;
  data: string | null;
  isComposing: boolean;
}

export interface CompositionEventData extends BaseEventData {
  eventType: "compositionstart" | "compositionupdate" | "compositionend";
  data: string;
  locale?: string;
}

export type EventData =
  | KeyboardEventData
  | InputEventData
  | CompositionEventData;

export interface DelayRow {
  id: number;
  isDelayRow: true;
  delay: number;
  timestamp: number;
}

export type EventTableRow = EventData | DelayRow;

export interface EventFilters {
  keydown: boolean;
  keyup: boolean;
  keypress: boolean;
  input: boolean;
  beforeinput: boolean;
  compositionstart: boolean;
  compositionupdate: boolean;
  compositionend: boolean;
}

export interface ColumnConfig {
  key: string;
  header: string;
  eventTypes: string[]; // Which event types use this column
  accessor: (event: EventData) => string | number | boolean | null;
  formatter?: (value: string | number | boolean | null) => string;
}

export const defaultFilters: EventFilters = {
  keydown: true,
  keyup: true,
  keypress: true,
  input: true,
  beforeinput: false,
  compositionstart: true,
  compositionupdate: true,
  compositionend: true,
};

export const MAX_EVENTS = 1000;
