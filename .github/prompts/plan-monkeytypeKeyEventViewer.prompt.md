# Plan: Monkeytype-Styled Key Event Viewer

Create a keyboard event viewer web application that replicates the functionality of domeventviewer.com but with Monkeytype's signature dark theme and styling, featuring real-time key event capture and display.

## Implementation Steps

### 1. Create event capture system

Build React hooks to listen for keyboard events with full event data collection including timestamps, key properties, and modifiers in `src/hooks/useKeyboardEvents.ts`

**Event Types to Capture:**

- `keydown` - Fired when a key is initially pressed
- `keyup` - Fired when a key is released
- `keypress` - Fired for printable characters (deprecated but included for compatibility)
- `input` - Fired when input value changes
- `compositionstart` - Fired when IME composition starts
- `compositionupdate` - Fired during IME composition updates
- `compositionend` - Fired when IME composition ends
- `focus` - Fired when textarea gains focus
- `blur` - Fired when textarea loses focus

**Event Data Structure:**

- ID (sequential counter)
- Timestamp (using `performance.now()` for microsecond precision)
- Event type
- Key properties (`key`, `code`, `keyCode`, `charCode`, `which`)
- Modifier keys (`ctrlKey`, `shiftKey`, `altKey`, `metaKey`)
- Additional properties (`repeat`, `location`, `isComposing`)
- Input-specific data (`inputType`, `data`)
- Current textarea value at time of event

### 2. Design main layout components

Replace current `src/App.tsx` content with:

- MT logo in top left corner (existing SVG with main color)
- Large textarea input field for capturing events (focused by default)
- Clear button positioned on the right side of textarea
- Event display options below textarea

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────┐
│ [MT Logo]                          Key Event Viewer      │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ [Clear Button]  │
│ │                                     │                 │
│ │         Textarea Input              │                 │
│ │                                     │                 │
│ └─────────────────────────────────────┘                 │
├─────────────────────────────────────────────────────────┤
│ Display Options: [☑] keydown [☑] keyup [☑] input ...   │
├─────────────────────────────────────────────────────────┤
│                Event Table                              │
└─────────────────────────────────────────────────────────┘
```

### 3. Build event table component

Create `src/components/EventTable.tsx` to display chronological events:

**Dynamic Table Columns:**
The table columns adapt based on enabled event types to show only relevant properties:

**Base Columns (always shown):**

- ID (sequential number)
- Timestamp (performance.now() value)
- Event Type (keydown, keyup, etc.)
- Textarea Value (current value when event occurred)

**Keyboard Event Columns (keydown, keyup, keypress):**

- Key (the key value)
- Code (physical key code)
- KeyCode (legacy numeric code)
- Which (legacy property)
- CharCode (for keypress events)
- Modifiers (Ctrl+Shift+Alt+Meta indicators)
- Repeat (boolean indicator)
- Location (standard, left, right, numpad)

**Input Event Columns (input, beforeinput):**

- Input Type (insertText, deleteContentBackward, etc.)
- Data (inserted/deleted text content)
- Is Composing (boolean)

**Composition Event Columns (compositionstart, compositionupdate, compositionend):**

- Data (composition text)
- Locale (composition locale if available)

**Focus Event Columns (focus, blur):**

- Related Target (element that lost/gained focus)

**Column Visibility Logic:**

```typescript
// Example: If only 'input' events are enabled
enabledEvents = ['input']
→ Show: ID, Timestamp, Event Type, Input Type, Data, Is Composing, Textarea Value

// Example: If 'keydown' and 'keyup' are enabled
enabledEvents = ['keydown', 'keyup']
→ Show: ID, Timestamp, Event Type, Key, Code, KeyCode, Which, Modifiers, Repeat, Location, Textarea Value

// Example: Mixed event types
enabledEvents = ['keydown', 'input', 'focus']
→ Show: ID, Timestamp, Event Type, Key, Code, KeyCode, Which, Modifiers, Repeat, Location, Input Type, Data, Is Composing, Related Target, Textarea Value
```

**Special Features:**

- Dynamic column headers based on active event filters
- Earliest events show at top (chronological order)
- Delay rows inserted between events if gap > 10ms
- Responsive table that works on different screen sizes
- Empty cells for properties not applicable to specific event types
- Monkeytype color scheme throughout

### 4. Add filtering controls

Implement toggle switches in `src/components/EventOptions.tsx`:

- Individual checkboxes for each event type
- "Show All" / "Hide All" quick actions
- Event counter display (showing filtered vs total events)

### 5. Implement event state management

- TypeScript interfaces for event data and delay rows
- React state for event collection with configurable limit (const MAX_EVENTS = 1000)
- Event filtering state management
- Clear functionality to reset all events
- Auto-scroll to latest events option

### 6. Style with Monkeytype theme

Apply consistent styling using existing custom colors:

- `bg-bg` (#323437) - Main background
- `bg-sub-alt` (#2c2e31) - Card/table backgrounds
- `text-text` (#d1d0c5) - Primary text
- `text-sub` (#646669) - Secondary text
- `bg-main` (#e2b714) - Accent color for buttons/highlights
- `border-sub` - Subtle borders and dividers

**Design Principles:**

- Clean, minimalist interface like Monkeytype
- Proper spacing and typography hierarchy
- Smooth hover and focus states
- Accessible color contrast
- Responsive design for mobile and desktop

## Technical Specifications

### Performance Considerations

- Use `performance.now()` for precise event timing
- Implement MAX_EVENTS limit (1000) to prevent memory issues
- No virtualization needed - just log everything up to limit
- Efficient event listener management with proper cleanup

### Event Capture Scope

Capture every possible keyboard-related event on the textarea:

- All keyboard events (keydown, keyup, keypress)
- All input events (input, beforeinput if available)
- All composition events (compositionstart, compositionupdate, compositionend)
- Focus management events (focus, blur)

### Data Structure

```typescript
interface BaseEventData {
  id: number;
  timestamp: number; // performance.now()
  eventType: string;
  textareaValue: string;
}

interface KeyboardEventData extends BaseEventData {
  eventType: "keydown" | "keyup" | "keypress";
  key: string;
  code: string;
  keyCode: number;
  charCode: number;
  which: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  repeat: boolean;
  location: number;
}

interface InputEventData extends BaseEventData {
  eventType: "input" | "beforeinput";
  inputType: string;
  data: string | null;
  isComposing: boolean;
}

interface CompositionEventData extends BaseEventData {
  eventType: "compositionstart" | "compositionupdate" | "compositionend";
  data: string;
  locale?: string;
}

interface FocusEventData extends BaseEventData {
  eventType: "focus" | "blur";
  relatedTarget: string | null; // element selector or null
}

type EventData =
  | KeyboardEventData
  | InputEventData
  | CompositionEventData
  | FocusEventData;

interface DelayRow {
  id: number;
  isDelayRow: true;
  delay: number;
  timestamp: number;
}

type EventTableRow = EventData | DelayRow;
```

### Dynamic Column Management

```typescript
interface ColumnConfig {
  key: string;
  header: string;
  eventTypes: string[]; // Which event types use this column
  accessor: (event: EventData) => string | number | boolean;
}

const COLUMN_CONFIGS: ColumnConfig[] = [
  { key: "id", header: "ID", eventTypes: ["*"], accessor: (e) => e.id },
  {
    key: "timestamp",
    header: "Timestamp",
    eventTypes: ["*"],
    accessor: (e) => e.timestamp,
  },
  {
    key: "eventType",
    header: "Event Type",
    eventTypes: ["*"],
    accessor: (e) => e.eventType,
  },
  {
    key: "key",
    header: "Key",
    eventTypes: ["keydown", "keyup", "keypress"],
    accessor: (e) => (e as KeyboardEventData).key,
  },
  {
    key: "inputType",
    header: "Input Type",
    eventTypes: ["input", "beforeinput"],
    accessor: (e) => (e as InputEventData).inputType,
  },
  // ... more column definitions
];
```

### File Structure

```
src/
├── App.tsx                    # Main application component
├── types/
│   └── events.ts              # Event data interfaces
├── hooks/
│   └── useKeyboardEvents.ts   # Event capture hook
├── components/
│   ├── EventTable.tsx         # Event display table
│   ├── EventOptions.tsx       # Filter controls
│   └── TextareaInput.tsx      # Input field component
└── utils/
    └── eventHelpers.ts        # Event formatting utilities
```

## Success Criteria

1. **Functionality**: Captures and displays all keyboard events with accurate timing
2. **Performance**: Handles rapid typing without lag or memory issues
3. **Usability**: Intuitive interface with clear event filtering options
4. **Aesthetics**: Matches Monkeytype's design language and color scheme
5. **Accessibility**: Proper keyboard navigation and screen reader support
6. **Accuracy**: Precise event timing using performance.now() for millisecond accuracy
