import type { EventData, EventFilters } from "../types/events";
import {
  getVisibleColumns,
  getCellValue,
  formatDelay,
  getColumnHeaderColor,
  EVENT_COLORS,
} from "../utils/eventHelpers";
import { addDelayRowsToEvents } from "../utils/delayRows";

interface EventTableProps {
  events: EventData[];
  filters: EventFilters;
  showDelays: boolean;
}

export function EventTable({ events, filters, showDelays }: EventTableProps) {
  const visibleColumns = getVisibleColumns(filters);
  const eventsWithDelays = showDelays ? addDelayRowsToEvents(events) : events;

  if (events.length === 0) {
    return (
      <div className="bg-sub-alt rounded-lg p-8 border border-sub/20 text-center">
        <p className="text-sub text-lg">No events captured yet</p>
        <p className="text-sub/70 text-sm mt-2">
          Start typing in the textarea above to see events
        </p>
      </div>
    );
  }

  return (
    <div className="bg-sub-alt rounded-lg border border-sub/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg border-b border-sub/20">
              {visibleColumns.map((column) => {
                const headerColor = getColumnHeaderColor(column);
                return (
                  <th
                    key={column.key}
                    className="px-3 py-3 text-left text-xs font-medium text-sub uppercase tracking-wider whitespace-nowrap"
                  >
                    {headerColor ? (
                      <span
                        className="px-2 py-1 rounded text-white text-xs font-medium uppercase tracking-wider"
                        style={{ backgroundColor: headerColor }}
                      >
                        {column.header}
                      </span>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-sub/10">
            {eventsWithDelays.map((event) => {
              // Handle delay rows
              if (showDelays && "isDelayRow" in event) {
                return (
                  <tr
                    key={event.id}
                    className="bg-error/5 border-l-4 border-error/30"
                  >
                    <td
                      colSpan={visibleColumns.length}
                      className="px-3 py-2 text-center text-error/100 text-xs font-mono"
                    >
                      ⏱️ Delay: {formatDelay(event.delay)}
                    </td>
                  </tr>
                );
              }

              // Handle regular event rows
              return (
                <tr
                  key={event.id}
                  className="hover:bg-bg/30 transition-colors duration-150"
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={`${event.id}-${column.key}`}
                      className="px-3 py-2 text-text font-mono text-xs whitespace-nowrap"
                    >
                      {column.key === "eventType" && "eventType" in event ? (
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                EVENT_COLORS[
                                  event.eventType as keyof typeof EVENT_COLORS
                                ],
                            }}
                          />
                          <span>{getCellValue(event as EventData, column)}</span>
                        </div>
                      ) : (
                        "eventType" in event ? getCellValue(event as EventData, column) : "-"
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table footer with event count */}
      <div className="bg-bg px-4 py-3 border-t border-sub/20">
        <div className="flex items-center justify-between text-xs text-sub">
          <span>
            Showing {events.length} events
            {showDelays && eventsWithDelays.filter((e) => "isDelayRow" in e).length > 0 &&
              ` with ${
                eventsWithDelays.filter((e) => "isDelayRow" in e).length
              } delay rows`}
          </span>
          <span>Events are shown in chronological order (newest first)</span>
        </div>
      </div>
    </div>
  );
}
