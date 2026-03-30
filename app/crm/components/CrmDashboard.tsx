"use client";
import { useState, useEffect } from "react";
import { ResponsiveGridLayout, useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import ActionsAndAlert from "./CrmDashboardComponents.tsx/ActionsAndAlert";


type LayoutItem = {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
    static?: boolean;
};

type Layouts = Record<string, LayoutItem[]>;

const defaultLayouts: Layouts = {
    lg: [
        { i: "actions-and-alerts", x: 0, y: 0, w: 3, h: 6, minH: 3 },
        { i: "overview", x: 3, y: 0, w: 6, h: 3, minH: 3, minW: 3.2 },
        { i: "reminders", x: 9, y: 0, w: 3, h: 5, minH: 3 },
        { i: "key-indicators",        x: 3, y: 3, w: 6, h: 3 },
        { i: "recent-interactions", x: 0, y: 6, w: 3, h: 5, minH: 4 },
        { i: "monthly-target",      x: 3, y: 6, w: 3, h: 5 },
        { i: "kpi-meter",   x: 6, y: 6, w: 3, h: 5, minH: 4 },
        { i: "appointments", x: 9, y: 5, w: 3, h: 6, minH: 6 },
        { i: "sales-overview",      x: 0, y: 11, w: 5, h: 6 },
        { i: "invoices",      x: 5, y: 11, w: 7, h: 6 },
        { i: "sales-report", x: 3, y: 4, w: 3, h: 6, minH: 4 },
        { i: "revenue-analytics",      x: 0, y: 17, w: 12, h: 6 },
    ],
};

export default function CrmDashboard() {
    
    const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);

    const { width, containerRef, mounted } = useContainerWidth();


    const components: Record<string, React.ReactNode> = {
        "actions-and-alerts": <ActionsAndAlert  />,
        "overview": <ActionsAndAlert />,
        "reminders": <ActionsAndAlert />,
        "key-indicators": <ActionsAndAlert  />,
        "recent-interactions": <ActionsAndAlert />,
        "monthly-target": <ActionsAndAlert />,
        "kpi-meter": <ActionsAndAlert />,
        "appointments": <ActionsAndAlert />,
        "sales-overview": <ActionsAndAlert />,
        "invoices": <ActionsAndAlert />,
        "revenue-analytics": <ActionsAndAlert />,
    };

    return (
        <div className="p-6 bg-white">

            <div ref={containerRef}>
                {mounted && (
                    <ResponsiveGridLayout
                        className="layout"
                        width={width}
                        layouts={layouts}
                        onLayoutChange={(_, allLayouts: unknown) => setLayouts(allLayouts as Layouts)}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={30}
                        {...{ isDraggable: true, isResizable: true, draggableHandle: ".drag-handle", }}
                        // isDraggable
                        // isResizable
                        margin={[16, 16]}
                        containerPadding={[0, 0]}
                    // draggableHandle=".drag-handle"
                    >
                        {Object.entries(components).map(([key, component]) => (
                            <div key={key} className="overflow-auto shadow-md rounded-xl">
                                {component}
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                )}
            </div>
        </div>
    );
}
