'use client';

import { useEffect, useState } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout as LayoutType } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

interface DashboardGridProps {
  children: React.ReactNode;
  layouts: LayoutItem[];
  onLayoutChange?: (layout: LayoutType) => void;
}

export default function DashboardGrid({ children, layouts, onLayoutChange }: DashboardGridProps) {
  const [width, setWidth] = useState(1200);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      const newWidth = window.innerWidth - 48;
      setWidth(newWidth);
      setIsMobile(window.innerWidth < 768);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Adjust layout for mobile - single column
  const responsiveLayouts = isMobile
    ? layouts.map((layout, index) => ({
        ...layout,
        x: 0,
        y: index * 3,
        w: 12,
        h: 3
      }))
    : layouts;

  const gridProps = {
    className: 'layout',
    layout: responsiveLayouts,
    cols: 12,
    rowHeight: isMobile ? 90 : 100,
    width: width,
    isDraggable: !isMobile,
    isResizable: !isMobile,
    draggableHandle: '.drag-handle',
    onLayoutChange: onLayoutChange
  };

  return (
    <GridLayout {...gridProps}>
      {children}
    </GridLayout>
  );
}
