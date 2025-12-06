import { useState } from "react";
import type { EventFilters, EventData } from "../types/events";
import { EVENT_COLORS } from "../utils/eventHelpers";
import { ExportImportModal } from "./ExportImportModal";

interface EventOptionsProps {
  filters: EventFilters;
  onFiltersChange: (filters: Partial<EventFilters>) => void;
  eventCount: number;
  totalEvents: number;
  events: EventData[];
  showDelays: boolean;
  onShowDelaysChange: (showDelays: boolean) => void;
  onImportEvents: (events: EventData[]) => void;
}

export function EventOptions({
  filters,
  onFiltersChange,
  eventCount,
  totalEvents,
  events,
  showDelays,
  onShowDelaysChange,
  onImportEvents,
}: EventOptionsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"export" | "import">("export");

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
    { key: "input", label: "input", description: "Text input changes" },
    {
      key: "beforeinput",
      label: "beforeinput",
      description: "Before text input",
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

  const handleExport = () => {
    setModalMode("export");
    setModalOpen(true);
  };

  const handleImport = () => {
    setModalMode("import");
    setModalOpen(true);
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
          <label className="flex items-center cursor-pointer text-xs text-text">
            <input
              type="checkbox"
              checked={showDelays}
              onChange={(e) => onShowDelaysChange(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 mr-2 ${
                showDelays
                  ? "border-main bg-main shadow-sm"
                  : "border-sub hover:border-main/70 bg-bg"
              }`}
            >
              {showDelays && (
                <svg
                  className="w-2.5 h-2.5 text-bg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            Show Delays
          </label>
          <button
            onClick={handleExport}
            className="text-xs px-2 py-1 bg-sub/20 hover:bg-sub/30 text-text rounded transition-colors duration-200"
            disabled={events.length === 0}
          >
            Export JSON
          </button>
          <button
            onClick={handleImport}
            className="text-xs px-2 py-1 bg-sub/20 hover:bg-sub/30 text-text rounded transition-colors duration-200"
          >
            Import JSON
          </button>
        </div>
      </div>

      {/* Event type toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {eventTypes.map(({ key, label, description }) => (
          <label
            key={key}
            className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-sub-alt/30 transition-all duration-200"
            title={description}
          >
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={() => handleToggle(key)}
              className="sr-only"
            />
            {/* Custom checkbox */}
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                filters[key]
                  ? "border-main bg-main shadow-sm"
                  : "border-sub hover:border-main/70 bg-bg"
              }`}
            >
              {filters[key] && (
                <svg
                  className="w-3 h-3 text-bg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 ml-4 transition-opacity duration-200"
              style={{
                backgroundColor:
                  EVENT_COLORS[key as keyof typeof EVENT_COLORS],
                opacity: filters[key] ? 1 : 0.4,
              }}
            />
            <span
              className={`text-sm font-mono ml-1.5 transition-colors duration-200 ${
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

      <ExportImportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        events={events}
        onImportEvents={onImportEvents}
        mode={modalMode}
      />
    </div>
  );
}
