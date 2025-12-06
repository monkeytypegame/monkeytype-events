import type {
  EventData,
  KeyboardEventData,
  InputEventData,
  CompositionEventData,
  ColumnConfig,
  EventFilters,
} from "../types/events";

const keyColor = "#1FA2FF";
const inputColor = "#1cad73";
const compositionColor = "#8A52FF";

// Color scheme for each event type
export const EVENT_COLORS = {
  keydown: keyColor,
  keyup: keyColor,
  keypress: keyColor,
  input: inputColor,
  beforeinput: inputColor,
  compositionstart: compositionColor,
  compositionupdate: compositionColor,
  compositionend: compositionColor,
} as const;

export const formatTimestamp = (timestamp: number): string => {
  return timestamp.toFixed(2) + "ms";
};

export const formatDelay = (delay: number): string => {
  return `+${delay.toFixed(2)}ms`;
};

export const formatModifiers = (event: KeyboardEventData): string => {
  const modifiers = [];
  if (event.ctrlKey) modifiers.push("Ctrl");
  if (event.shiftKey) modifiers.push("Shift");
  if (event.altKey) modifiers.push("Alt");
  if (event.metaKey) modifiers.push("Meta");
  return modifiers.join("+") || "";
};

export const formatLocation = (location: number): string => {
  const locations = {
    0: "Standard",
    1: "Left",
    2: "Right",
    3: "Numpad",
  };
  return locations[location as keyof typeof locations] || "Unknown";
};

export const formatBoolean = (value: boolean): string => {
  return value ? "✓" : "";
};

export const formatTextareaValue = (value: string): string => {
  if (!value) return "(empty)";
  if (value.length > 50) {
    return value.substring(0, 47) + "...";
  }
  return JSON.stringify(value); // Shows escaped characters
};

// Get the primary color for a column header based on event types
export const getColumnHeaderColor = (column: ColumnConfig): string | null => {
  // Universal columns don't get colors
  if (column.eventTypes.includes("*")) return null;

  // Find the first event type that has a defined color
  for (const eventType of column.eventTypes) {
    if (eventType in EVENT_COLORS) {
      return EVENT_COLORS[eventType as keyof typeof EVENT_COLORS];
    }
  }

  return null;
};

export const COLUMN_CONFIGS: ColumnConfig[] = [
  // Base columns (always shown)
  {
    key: "id",
    header: "ID",
    eventTypes: ["*"],
    accessor: (e) => e.id,
  },
  {
    key: "timestamp",
    header: "Timestamp",
    eventTypes: ["*"],
    accessor: (e) => e.timestamp,
    formatter: (value) => formatTimestamp(value as number),
  },
  {
    key: "eventType",
    header: "Event Type",
    eventTypes: ["*"],
    accessor: (e) => e.eventType,
  },

  // Keyboard event columns
  {
    key: "key",
    header: "Key",
    eventTypes: ["keydown", "keyup", "keypress"],
    accessor: (e) => (e as KeyboardEventData).key || "",
  },
  {
    key: "code",
    header: "Code",
    eventTypes: ["keydown", "keyup", "keypress"],
    accessor: (e) => (e as KeyboardEventData).code || "",
  },
  {
    key: "keyCode",
    header: "KeyCode",
    eventTypes: ["keydown", "keyup", "keypress"],
    accessor: (e) => {
      const keyCode = (e as KeyboardEventData).keyCode;
      return keyCode && keyCode !== 0 ? keyCode.toString() : "";
    },
  },
  {
    key: "charCode",
    header: "CharCode",
    eventTypes: ["keypress"],
    accessor: (e) => {
      const charCode = (e as KeyboardEventData).charCode;
      return charCode && charCode !== 0 ? charCode.toString() : "";
    },
  },
  {
    key: "modifiers",
    header: "Modifiers",
    eventTypes: ["keydown", "keyup", "keypress"],
    accessor: (e) => formatModifiers(e as KeyboardEventData),
  },
  {
    key: "location",
    header: "Location",
    eventTypes: ["keydown", "keyup", "keypress"],
    accessor: (e) => {
      const location = (e as KeyboardEventData).location;
      return location !== undefined ? location : 0;
    },
    formatter: (value) => formatLocation(value as number),
  },
  {
    key: "duration",
    header: "Duration",
    eventTypes: ["keyup"],
    accessor: (e) => (e as KeyboardEventData).duration ?? null,
    formatter: (value) =>
      value !== null && typeof value === "number"
        ? `${value.toFixed(2)}ms`
        : "",
  },

  // Input event columns
  {
    key: "inputType",
    header: "Input Type",
    eventTypes: ["input", "beforeinput"],
    accessor: (e) => (e as InputEventData).inputType || "",
  },
  {
    key: "data",
    header: "Data",
    eventTypes: [
      "input",
      "beforeinput",
      "compositionstart",
      "compositionupdate",
      "compositionend",
    ],
    accessor: (e) => {
      if (e.eventType === "input" || e.eventType === "beforeinput") {
        return (e as InputEventData).data || "";
      }
      return (e as CompositionEventData).data || "";
    },
    formatter: (value) => (value === null ? "" : JSON.stringify(value)),
  },
  {
    key: "isComposing",
    header: "Composing",
    eventTypes: ["input", "beforeinput"],
    accessor: (e) => (e as InputEventData).isComposing,
    formatter: (value) => formatBoolean(value as boolean),
  },

  // Always last column
  {
    key: "textareaValue",
    header: "Textarea Value",
    eventTypes: ["*"],
    accessor: (e) => e.textareaValue,
    formatter: (value) => formatTextareaValue(value as string),
  },
];

export const getVisibleColumns = (filters: EventFilters): ColumnConfig[] => {
  const enabledEventTypes = Object.entries(filters)
    .filter(([, enabled]) => enabled)
    .map(([eventType]) => eventType);

  return COLUMN_CONFIGS.filter((column) => {
    // Always show columns marked with '*'
    if (column.eventTypes.includes("*")) return true;

    // Show column if any of its event types are enabled
    return column.eventTypes.some((eventType) =>
      enabledEventTypes.includes(eventType)
    );
  });
};

export const getCellValue = (
  event: EventData,
  column: ColumnConfig
): string => {
  try {
    const value = column.accessor(event);
    if (column.formatter) {
      return column.formatter(value);
    }
    return String(value ?? "");
  } catch {
    return "";
  }
};
