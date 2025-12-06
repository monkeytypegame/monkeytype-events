import { useEffect, useRef, useState } from "react";
import { useKeyboardEvents } from "./hooks/useKeyboardEvents";
import { TextareaInput } from "./components/TextareaInput";
import { EventOptions } from "./components/EventOptions";
import { Timeline } from "./components/Timeline";
import { EventTable } from "./components/EventTable";

function App() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showDelays, setShowDelays] = useState(true);
  const {
    events,
    allEvents,
    filters,
    attachEventListeners,
    clearEvents,
    updateFilters,
  } = useKeyboardEvents();

  const handleClearAll = () => {
    // Clear the textarea content
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
    // Clear the events
    clearEvents();
  };

  // Add escape key listener to clear events and textarea
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClearAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Enhanced attachEventListeners to store textarea reference
  const attachEventListenersWithRef = (element: HTMLTextAreaElement) => {
    textareaRef.current = element;
    return attachEventListeners(element);
  };

  // Calculate event statistics
  const totalEvents = allEvents.length;
  const filteredEventCount = events.length;

  return (
    <div className="min-h-screen bg-bg p-4 md:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Textarea Input Section */}
        <TextareaInput
          onAttachListeners={attachEventListenersWithRef}
          onClear={handleClearAll}
        />

        {/* Event Options/Filters */}
        <EventOptions
          filters={filters}
          onFiltersChange={updateFilters}
          eventCount={filteredEventCount}
          totalEvents={totalEvents}
          events={allEvents}
          showDelays={showDelays}
          onShowDelaysChange={setShowDelays}
        />

        {/* Timeline */}
        <Timeline events={events} />

        {/* Event Table */}
        <EventTable events={events} filters={filters} showDelays={showDelays} />
      </div>
    </div>
  );
}

export default App;
