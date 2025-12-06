import type { EventData, KeyboardEventData } from "../types/events";
import { EVENT_COLORS } from "../utils/eventHelpers";

interface TimelineProps {
  events: EventData[];
}

interface TimelineBar {
  id: number;
  label: string;
  startTime: number;
  duration: number;
  color: string;
  level: number; // Row level for overlapping bars
  type: "keypress" | "input" | "composition";
}

export function Timeline({ events }: TimelineProps) {
  // Find all keyup events with duration and input events
  const timelineBars: TimelineBar[] = [];

  events.forEach((event) => {
    if (event.eventType === "keyup") {
      const kbEvent = event as KeyboardEventData;

      // If this keyup event has a duration, it means we had a matching keydown
      if (kbEvent.duration !== undefined && kbEvent.duration > 0) {
        // Calculate the start time by subtracting duration from keyup timestamp
        const startTime = kbEvent.timestamp - kbEvent.duration;

        timelineBars.push({
          id: kbEvent.id,
          label: kbEvent.key,
          startTime: startTime,
          duration: kbEvent.duration,
          color: EVENT_COLORS.keydown,
          level: 0, // Will be calculated later
          type: "keypress",
        });
      }
    } else if (
      event.eventType === "input" ||
      event.eventType === "beforeinput"
    ) {
      // Input events are instantaneous - display as dots
      timelineBars.push({
        id: event.id,
        label: `#${event.id}`,
        startTime: event.timestamp,
        duration: 0, // No duration - will render as dot
        color:
          event.eventType === "input"
            ? EVENT_COLORS.input
            : EVENT_COLORS.beforeinput,
        level: 0, // Will be calculated later
        type: "input",
      });
    } else if (
      event.eventType === "compositionstart" ||
      event.eventType === "compositionupdate" ||
      event.eventType === "compositionend"
    ) {
      // Composition events are instantaneous - display as dots
      timelineBars.push({
        id: event.id,
        label: `#${event.id}`,
        startTime: event.timestamp,
        duration: 0, // No duration - will render as dot
        color:
          event.eventType === "compositionstart"
            ? EVENT_COLORS.compositionstart
            : event.eventType === "compositionupdate"
            ? EVENT_COLORS.compositionupdate
            : EVENT_COLORS.compositionend,
        level: 0, // Will be calculated later
        type: "composition",
      });
    }
  });

  if (timelineBars.length === 0) {
    return (
      <div className="bg-sub-alt rounded-lg p-4 border border-sub/20">
        <h3 className="text-sm font-medium text-text mb-3">Event Timeline</h3>
        <div className="text-xs text-sub">
          No events found. Total events: {events.length}
          <br />
          Keyup events: {events.filter((e) => e.eventType === "keyup").length}
          <br />
          Input events:{" "}
          {
            events.filter(
              (e) => e.eventType === "input" || e.eventType === "beforeinput"
            ).length
          }
          <br />
          Composition events:{" "}
          {
            events.filter(
              (e) =>
                e.eventType === "compositionstart" ||
                e.eventType === "compositionupdate" ||
                e.eventType === "compositionend"
            ).length
          }
        </div>
      </div>
    );
  }

  // Separate keypress, input, and composition events for different processing
  const keypressBars = timelineBars.filter((b) => b.type === "keypress");
  const beforeInputBars = timelineBars.filter(
    (b) =>
      b.type === "input" &&
      events.find((e) => e.id === b.id)?.eventType === "beforeinput"
  );
  const inputBars = timelineBars.filter(
    (b) =>
      b.type === "input" &&
      events.find((e) => e.id === b.id)?.eventType === "input"
  );
  const compositionStartBars = timelineBars.filter(
    (b) =>
      b.type === "composition" &&
      events.find((e) => e.id === b.id)?.eventType === "compositionstart"
  );
  const compositionUpdateBars = timelineBars.filter(
    (b) =>
      b.type === "composition" &&
      events.find((e) => e.id === b.id)?.eventType === "compositionupdate"
  );
  const compositionEndBars = timelineBars.filter(
    (b) =>
      b.type === "composition" &&
      events.find((e) => e.id === b.id)?.eventType === "compositionend"
  );

  // Sort bars by start time for proper overlap detection
  keypressBars.sort((a, b) => a.startTime - b.startTime);

  // Calculate levels for keypress bars (overlapping)
  const keypressLevels: { endTime: number }[] = [];
  keypressBars.forEach((bar) => {
    const barEnd = bar.startTime + bar.duration;
    let level = 0;
    while (
      level < keypressLevels.length &&
      keypressLevels[level].endTime > bar.startTime
    ) {
      level++;
    }
    bar.level = level;
    if (level >= keypressLevels.length) {
      keypressLevels.push({ endTime: barEnd });
    } else {
      keypressLevels[level].endTime = barEnd;
    }
  });

  // Assign beforeinput events to dedicated row
  const maxKeypressLevel =
    keypressBars.length > 0
      ? Math.max(...keypressBars.map((b) => b.level))
      : -1;
  const beforeInputLevel = maxKeypressLevel + 2; // Leave one row gap
  beforeInputBars.forEach((bar) => {
    bar.level = beforeInputLevel;
  });

  // Assign input events to dedicated row (one row below beforeinput)
  const inputLevel = beforeInputLevel + 1;
  inputBars.forEach((bar) => {
    bar.level = inputLevel;
  });

  // Assign composition events to separate dedicated rows
  const compositionStartLevel = inputLevel + 1;
  compositionStartBars.forEach((bar) => {
    bar.level = compositionStartLevel;
  });

  const compositionUpdateLevel = compositionStartLevel + 1;
  compositionUpdateBars.forEach((bar) => {
    bar.level = compositionUpdateLevel;
  });

  const compositionEndLevel = compositionUpdateLevel + 1;
  compositionEndBars.forEach((bar) => {
    bar.level = compositionEndLevel;
  });

  // Calculate timeline dimensions
  const minTime = 0;
  const maxTime = Math.max(...events.map((e) => e.timestamp));
  const timeRange = maxTime - minTime;
  const allBars = [
    ...keypressBars,
    ...beforeInputBars,
    ...inputBars,
    ...compositionStartBars,
    ...compositionUpdateBars,
    ...compositionEndBars,
  ];
  const maxLevel =
    allBars.length > 0 ? Math.max(...allBars.map((b) => b.level)) : 0;
  // Only count levels that actually have bars
  const activeLevels = Array.from(
    new Set(allBars.map((bar) => bar.level))
  ).sort((a, b) => a - b);
  const timelineHeight = activeLevels.length * 24 + 45; // 24px per active level + padding for axis and margins

  if (timeRange === 0) {
    return null;
  }

  // Generate dynamic row titles based on actual content in active levels only
  const getRowTitles = (): string[] => {
    const titles: string[] = [];

    // Only process levels that have bars
    for (const level of activeLevels) {
      const barsAtLevel = allBars.filter((bar) => bar.level === level);

      // Group by event type at this level
      const typeGroups: { [key: string]: number } = {};
      barsAtLevel.forEach((bar) => {
        const event = events.find((e) => e.id === bar.id);
        if (event) {
          typeGroups[event.eventType] = (typeGroups[event.eventType] || 0) + 1;
        }
      });

      const types = Object.keys(typeGroups);
      if (types.length === 1) {
        // Single type in this row
        const type = types[0];
        switch (type) {
          case "keyup":
            titles.push("Keypress");
            break;
          case "beforeinput":
            titles.push("Beforeinput");
            break;
          case "input":
            titles.push("Input");
            break;
          case "compositionstart":
            titles.push("Composition Start");
            break;
          case "compositionupdate":
            titles.push("Composition Update");
            break;
          case "compositionend":
            titles.push("Composition End");
            break;
          default:
            titles.push(type.charAt(0).toUpperCase() + type.slice(1));
            break;
        }
      } else {
        // Mixed types - show most common type
        const mostCommonType = Object.entries(typeGroups).sort(
          (a, b) => b[1] - a[1]
        )[0][0];
        titles.push(
          `${
            mostCommonType.charAt(0).toUpperCase() + mostCommonType.slice(1)
          } +${types.length - 1}`
        );
      }
    }

    // Merge consecutive "Keypress" titles
    const mergedTitles: string[] = [];
    let i = 0;
    while (i < titles.length) {
      if (titles[i] === "Keypress") {
        // Find the end of consecutive keypress rows
        let j = i;
        while (j < titles.length && titles[j] === "Keypress") {
          j++;
        }

        // Add single "Keypress" title for the middle row of the group
        const middleIndex = Math.floor((i + j - 1) / 2);
        for (let k = i; k < j; k++) {
          mergedTitles.push(k === middleIndex ? "Keypress" : "");
        }
        i = j;
      } else {
        mergedTitles.push(titles[i]);
        i++;
      }
    }

    return mergedTitles;
  };

  const rowTitles = getRowTitles();

  return (
    <div className="bg-sub-alt rounded-lg p-4 border border-sub/20">
      <h3 className="text-sm font-medium text-text mb-3">Event Timeline</h3>

      <div className="flex">
        {/* Row titles */}
        <div className="flex-shrink-0 w-40 pr-3">
          <div style={{ height: `${timelineHeight}px`, position: "relative" }}>
            {rowTitles.map((title, i) => (
              <div
                key={i}
                className="absolute text-xs text-text/60 font-medium flex items-center justify-end"
                style={{
                  top: i * 24 + 8,
                  height: 16,
                  right: 0,
                  width: "100%",
                }}
              >
                {title}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div
          className="flex-1 relative bg-bg rounded p-2"
          style={{ height: `${timelineHeight}px` }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* Row background tints */}
            {activeLevels.map((level, i) => (
              <rect
                key={`row-bg-${level}`}
                x="4"
                y={i * 24 + 5}
                width="calc(100% - 8px)"
                height="24"
                fill={i % 2 === 0 ? "var(--color-bg)" : "var(--color-sub-alt)"}
                opacity="0.3"
                rx="2"
              />
            ))}
            {/* Timeline bars */}
            {allBars.map((bar) => {
              const x = 1 + (bar.startTime / timeRange) * 98; // 1% left margin, 98% width for content
              const levelIndex = activeLevels.indexOf(bar.level);
              const y = levelIndex * 24 + 5; // Base position for 24px rows with top padding

              if (bar.type === "input" || bar.type === "composition") {
                // Render input events as dots
                return (
                  <g key={`${bar.type}-${bar.id}`}>
                    <circle
                      cx={`${x}%`}
                      cy={y + 12}
                      r="6"
                      fill={bar.color}
                      opacity="0.8"
                    />
                    <text
                      x={`${x}%`}
                      dx="11"
                      y={y + 16}
                      textAnchor="start"
                      className="fill-text text-xs font-mono"
                      style={{ fontSize: "8px" }}
                    >
                      {bar.label.replace("#", "")}
                    </text>
                  </g>
                );
              } else {
                // Render keypress events as bars
                const width = (bar.duration / timeRange) * 100;
                return (
                  <g key={`${bar.type}-${bar.id}`}>
                    <rect
                      x={`${x}%`}
                      y={y + 4}
                      width={`${width}%`}
                      height="16"
                      fill={bar.color}
                      rx="2"
                      opacity="0.8"
                    />
                    <text
                      x={`${x + 0.5}%`}
                      y={y + 15}
                      textAnchor="start"
                      className="fill-white text-xs font-mono"
                      style={{ fontSize: "9px" }}
                    >
                      {bar.label}
                    </text>
                  </g>
                );
              }
            })}

            {/* Time axis */}
            <line
              x1="1%"
              y1={timelineHeight - 25}
              x2="99%"
              y2={timelineHeight - 25}
              stroke="var(--color-sub)"
              strokeWidth="1"
            />

            {/* Time labels */}
            <text
              x="1%"
              y={timelineHeight - 12}
              className="fill-sub text-xs"
              style={{ fontSize: "10px" }}
            >
              0ms
            </text>
            <text
              x="99%"
              y={timelineHeight - 12}
              textAnchor="end"
              className="fill-sub text-xs"
              style={{ fontSize: "10px" }}
            >
              {maxTime.toFixed(0)}ms
            </text>
          </svg>
        </div>
      </div>

      {/* <div className="text-xs text-sub mt-2">
        Showing {keypressBars.length} keypress
        {keypressBars.length !== 1 ? "es" : ""}
        {beforeInputBars.length > 0 &&
          `, ${beforeInputBars.length} beforeinput`}
        {inputBars.length > 0 && `, ${inputBars.length} input`}
        {compositionStartBars.length > 0 &&
          `, ${compositionStartBars.length} compositionstart`}
        {compositionUpdateBars.length > 0 &&
          `, ${compositionUpdateBars.length} compositionupdate`}
        {compositionEndBars.length > 0 &&
          `, ${compositionEndBars.length} compositionend`}
        {maxLevel > 0 && ` across ${maxLevel + 1} rows`}
      </div> */}
    </div>
  );
}
