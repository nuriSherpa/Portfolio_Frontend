// src/components/projects/expandable-description.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableDescriptionProps {
  description: string;
}

export function ExpandableDescription({ description }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [overlayTop, setOverlayTop] = useState(0);
  const [overlayHeight, setOverlayHeight] = useState(400);
  const buttonRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if desktop
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  // Check if content needs Read More button
  useEffect(() => {
    const wordCount = description.split(/\s+/).length;
    setShouldShowButton(wordCount > 40);
  }, [description]);

  // Measure content height for overlay
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setOverlayHeight(Math.min(height + 80, 500));
    }
  }, [description]);

  // Update overlay position and hide preview immediately when expanded
  useEffect(() => {
    if (isExpanded && buttonRef.current && containerRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setOverlayTop(buttonRect.top - containerRect.top);
    }
  }, [isExpanded]);

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDesktop &&
        isExpanded &&
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, isDesktop]);

  // Get preview text
  const getPreviewText = () => {
    const words = description.split(/\s+/);
    if (words.length <= 40) return description;
    return words.slice(0, 40).join(' ') + '...';
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Desktop version */}
      {isDesktop ? (
        <>
          {/* Preview section - hidden immediately when expanded */}
          <div ref={buttonRef} className={isExpanded ? 'invisible' : 'visible'}>
            <div ref={previewRef}>
              <p className="text-grey-700 leading-relaxed">{getPreviewText()}</p>

              {/* Read More button */}
              {shouldShowButton && !isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="inline-flex items-center gap-1 text-red hover:text-red/80 font-medium text-sm transition-colors mt-2"
                >
                  Read More
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Overlay - appears immediately, no fade */}
          {isExpanded && (
            <div
              ref={overlayRef}
              className="absolute left-0 right-0 bg-white"
              style={{
                top: `${overlayTop}px`,
                height: `${overlayHeight}px`,
                zIndex: 50,
              }}
            >
              <div className="h-full flex flex-col">
                {/* Scrollable content */}
                <div ref={contentRef} className="flex-1 overflow-y-auto">
                  <p className="text-grey-700 leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>

                {/* Show less button */}
                <div className="flex justify-end py-3 border-t border-grey-100">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="inline-flex items-center gap-1 text-red hover:text-red/80 font-medium text-sm transition-colors"
                  >
                    Show less
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Mobile version */
        <div>
          <div className="text-grey-700 leading-relaxed">
            {!isExpanded ? (
              <>
                <span className="inline">{getPreviewText()}</span>
                {shouldShowButton && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="inline-flex items-center gap-1 text-red hover:text-red/80 font-medium text-sm transition-colors ml-1"
                  >
                    Read More
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <div>
                <p className="whitespace-pre-wrap mb-3">{description}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="inline-flex items-center gap-1 text-red hover:text-red/80 font-medium text-sm transition-colors"
                  >
                    Show less
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
