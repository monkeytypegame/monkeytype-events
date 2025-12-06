import type { EventFilters, EventData } from "../types/events";
import { EVENT_COLORS } from "../utils/eventHelpers";

interface EventOptionsProps {
  filters: EventFilters;
  onFiltersChange: (filters: Partial<EventFilters>) => void;
  eventCount: number;
  totalEvents: number;
  events: EventData[];
}

export function EventOptions({
  filters,
  onFiltersChange,
  eventCount,
  totalEvents,
  events,
}: EventOptionsProps) {
  // Calculate event counts by type
  const eventCounts = events.reduce((counts, event) => {
    counts[event.eventType] = (counts[event.eventType] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  const eventTypes = [
    { key: "keydown", label: "keydown", description: "Key press start" },
    { key: "keyup", label: "keyup", description: "Key press end" },
    {
      key: "keypress",
      label: "keypress",
      description: "Key press (deprecated)",
    },
    { key: "input", label: "input", description: "Text input changes" },
    {
      key: "beforeinput",
      label: "beforeinput",
      description: "Before text input",
    },
    {
      key: "compositionstart",
      label: "compositionstart",
      description: "IME composition start",
    },
    {
      key: "compositionupdate",
      label: "compositionupdate",
      description: "IME composition update",
    },
    {
      key: "compositionend",
      label: "compositionend",
      description: "IME composition end",
    },
  ] as const;

  const handleToggle = (eventType: keyof EventFilters) => {
    onFiltersChange({ [eventType]: !filters[eventType] });
  };

  const handleShowAll = () => {
    const allEnabled = Object.keys(filters).reduce((acc, key) => {
      acc[key as keyof EventFilters] = true;
      return acc;
    }, {} as EventFilters);
    onFiltersChange(allEnabled);
  };

  const handleHideAll = () => {
    const allDisabled = Object.keys(filters).reduce((acc, key) => {
      acc[key as keyof EventFilters] = false;
      return acc;
    }, {} as EventFilters);
    onFiltersChange(allDisabled);
  };

  return (
    <div className="bg-sub-alt rounded-lg p-4 border border-sub/20 space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Display Options</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-sub">
            Showing {eventCount} of {totalEvents} events
          </span>
          <button
            onClick={handleShowAll}
            className="text-xs px-2 py-1 bg-main/20 hover:bg-main/30 text-main rounded transition-colors duration-200"
          >
            Show All
          </button>
          <button
            onClick={handleHideAll}
            className="text-xs px-2 py-1 bg-error/20 hover:bg-error/30 text-error rounded transition-colors duration-200"
          >
            Hide All
          </button>
        </div>
      </div>

      {/* Event type toggles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {eventTypes.map(({ key, label, description }) => (
          <label
            key={key}
            className="flex items-center space-x-2 cursor-pointer group"
            title={description}
          >
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={() => handleToggle(key)}
                className="w-4 h-4 text-main bg-bg border-sub rounded focus:ring-main/50 focus:ring-2 transition-all duration-200"
              />
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    EVENT_COLORS[key as keyof typeof EVENT_COLORS],
                  opacity: filters[key] ? 1 : 0.3,
                }}
              />
            </div>
            <span
              className={`text-sm font-mono transition-colors duration-200 ${
                filters[key]
                  ? "text-text group-hover:text-main"
                  : "text-sub group-hover:text-text"
              }`}
            >
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Event statistics */}
      <div className="pt-3 border-t border-sub/20">
        <div className="flex flex-wrap gap-4 text-xs text-sub">
          {eventTypes.map(({ key, label }) => {
            const count = eventCounts[key] || 0;
            if (!filters[key] || count === 0) return null;
            return (
              <span key={key} className="font-mono flex items-center space-x-1">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      EVENT_COLORS[key as keyof typeof EVENT_COLORS],
                  }}
                />
                <span>
                  {label}: {count}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
