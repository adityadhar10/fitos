import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  summary: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * CollapsibleSection component
 * Reusable card wrapper that toggles visibility of secondary insights and metrics.
 */
export default function CollapsibleSection({
  title,
  summary,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="section-card">
      <div
        className="collapsible-header"
        onClick={() => setIsOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
      >
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>
            {title}
          </h2>
          {!isOpen && <p className="collapsible-summary">{summary}</p>}
        </div>
        <ChevronDown
          size={18}
          className={`collapsible-chevron ${isOpen ? "open" : ""}`}
        />
      </div>

      {isOpen && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
}
