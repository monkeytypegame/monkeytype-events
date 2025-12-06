import { useState, useEffect } from "react";
import type { EventData } from "../types/events";

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventData[];
  onImportEvents: (events: EventData[]) => void;
  mode: "export" | "import";
}

export function ExportImportModal({
  isOpen,
  onClose,
  events,
  onImportEvents,
  mode,
}: ExportImportModalProps) {
  const [importText, setImportText] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const exportJson = JSON.stringify(events, null, 2);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open and preserve scrollbar space
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const body = document.body;
      const originalOverflow = body.style.overflow;
      const originalPaddingRight = body.style.paddingRight;
      
      body.style.overflow = 'hidden';
      body.style.paddingRight = `${(parseInt(originalPaddingRight) || 0) + scrollbarWidth}px`;

      return () => {
        body.style.overflow = originalOverflow;
        body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleImport = () => {
    try {
      const importedEvents = JSON.parse(importText);
      if (Array.isArray(importedEvents)) {
        onImportEvents(importedEvents);
        onClose();
        setImportText("");
      } else {
        alert("Invalid format: Expected an array of events");
      }
    } catch {
      alert("Error parsing JSON data");
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-bg border border-sub rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-main">
            {mode === "export" ? "Export Events" : "Import Events"}
          </h2>
          <button
            onClick={onClose}
            className="text-sub hover:text-text transition-colors"
          >
            ✕
          </button>
        </div>

        {mode === "export" ? (
          <div className="flex flex-col flex-1">
            <div className="flex justify-between items-center mb-2">
              <p className="text-text">
                Copy the JSON data below ({events.length} events):
              </p>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-main text-bg rounded hover:bg-main/80 transition-colors"
              >
                {copySuccess ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea
              value={exportJson}
              readOnly
              className="flex-1 bg-bg border border-sub rounded p-3 text-text font-mono text-sm resize-none"
              style={{ minHeight: "300px" }}
            />
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <p className="text-text mb-2">Paste the JSON data below:</p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste exported JSON data here..."
              className="flex-1 bg-bg border border-sub rounded p-3 text-text font-mono text-sm resize-none"
              style={{ minHeight: "300px" }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-sub/20 hover:bg-sub/30 text-text rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="px-4 py-2 bg-main text-bg rounded hover:bg-main/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}