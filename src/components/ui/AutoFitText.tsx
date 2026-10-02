"use client";

import React, { useRef, useState, useLayoutEffect, useEffect } from "react";

interface AutoFitTextProps {
  children?: React.ReactNode;
  text: string;
  maxFontSizeVh?: number;
  minFontSizeVh?: number;
  maxFontSizePx?: number;
  minFontSizePx?: number;
  className?: string;
  style?: React.CSSProperties;
  lineHeight?: number | string;
}

export default function AutoFitText({
  children,
  text,
  maxFontSizeVh = 7.5,
  minFontSizeVh = 1.4,
  maxFontSizePx,
  minFontSizePx,
  className = "",
  style = {},
  lineHeight,
}: AutoFitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fontSizePx, setFontSizePx] = useState<number>(40);

  const calculateFit = () => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    if (containerWidth <= 0 || containerHeight <= 0) return;

    const vhInPx = window.innerHeight / 100;
    const maxPx = maxFontSizePx || maxFontSizeVh * vhInPx;
    const minPx = minFontSizePx || minFontSizeVh * vhInPx;

    let low = minPx;
    let high = maxPx;
    let best = minPx;

    // Binary search for exact font size in px where scrollWidth/scrollHeight fits container
    for (let i = 0; i < 12; i++) {
      const mid = (low + high) / 2;
      content.style.fontSize = `${mid}px`;

      const fitsWidth = content.scrollWidth <= containerWidth + 2;
      const fitsHeight = content.scrollHeight <= containerHeight + 2;

      if (fitsWidth && fitsHeight) {
        best = mid;
        low = mid;
      } else {
        high = mid;
      }
    }

    content.style.fontSize = `${best}px`;
    setFontSizePx(best);
  };

  useLayoutEffect(() => {
    calculateFit();
  }, [text]);

  useEffect(() => {
    calculateFit();

    const handleResize = () => {
      calculateFit();
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        calculateFit();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-w-0 min-h-0 flex items-center justify-center overflow-hidden"
    >
      <div
        ref={contentRef}
        className={className}
        style={{
          ...style,
          fontSize: `${fontSizePx}px`,
          ...(lineHeight !== undefined ? { lineHeight } : {}),
        }}
      >
        {children || text}
      </div>
    </div>
  );
}
