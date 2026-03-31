"use client";
import { useState, useEffect } from "react";
import { ResponsiveGridLayout, useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import ActionsAndAlert from "./CrmDashboardComponents/ActionsAndAlert";
import Appointments from "./CrmDashboardComponents/Appointments";
import Invoices from "./CrmDashboardComponents/Invoices";
import KeyIndicator from "./CrmDashboardComponents/KeyIndicators";
import KpiMeter from "./CrmDashboardComponents/KpiMeter";
import MonthlyTarget from "./CrmDashboardComponents/MonthlyTarget";
import Overview from "./CrmDashboardComponents/Overview";
import RecentInteraction from "./CrmDashboardComponents/RecentInteraction";
import Reminders from "./CrmDashboardComponents/Reminders";
import RevenueAnalytics from "./CrmDashboardComponents/RevenueAnalytics";
import SalesOverview from "./CrmDashboardComponents/SalesOverview";


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
        { i: "actions-and-alerts", x: 0, y: 0, w: 3, h: 8, minH: 3 },
        { i: "overview", x: 3, y: 0, w: 6, h: 4, minH: 3, minW: 3.2 },
        { i: "reminders", x: 9, y: 0, w: 3, h: 6, minH: 3 },
        { i: "key-indicators",        x: 3, y: 4, w: 6, h: 4 },
        { i: "recent-interactions", x: 0, y: 8, w: 3, h: 7, minH: 4 },
        { i: "monthly-target",      x: 3, y: 8, w: 3, h: 7 },
        { i: "kpi-meter",   x: 6, y: 8, w: 3, h: 7, minH: 4 },
        { i: "appointments", x: 9, y: 6, w: 3, h: 9, minH: 6 },
        { i: "sales-overview",      x: 0, y: 15, w: 5, h: 8 },
        { i: "invoices",      x: 5, y: 15, w: 7, h: 8 },
        // { i: "sales-report", x: 3, y: 4, w: 3, h: 6, minH: 4 },
        { i: "revenue-analytics",      x: 0, y: 23, w: 12, h: 8 },
    ],
};

export default function CrmDashboard() {
    
    const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);

    const { width, containerRef, mounted } = useContainerWidth();

    const dashboardData = {
        overview:   [
            { label: "Total Clients", value: 0 },
            { label: "Total Groups", value:  0 }
        ],
        keyIndicator: [
            { label: "New Leads", value:  0 },
            { label: "New Opportunities", value: 0},
            { label: "Total Sales", value:  0 },
            { label: "Conversion Rate", value:  0 }
        ],
        monthlyTarget: [
            { name: "value", value: 80, fill: "#FF5A4E" },   // red portion
            { name: "remaining", value: 20, fill: "#E5E7EB" } // grey portion
        ],
        KpiMeter:[
            { name: "value", value: 0, fill: "#FF5A4E" },     // progress (currently 0)
            { name: "remaining", value: 50, fill: "#D1D5DB" } // grey arc
        ]
        
    }


    const components: Record<string, React.ReactNode> = {
        "actions-and-alerts": <ActionsAndAlert  />,
        "overview": <Overview data={dashboardData.overview}/>,
        "reminders": <Reminders />,
        "key-indicators": <KeyIndicator  data={dashboardData.keyIndicator}/>,
        "recent-interactions": <RecentInteraction />,
        "monthly-target": <MonthlyTarget data={dashboardData.monthlyTarget}/>,
        "kpi-meter": <KpiMeter data={dashboardData.KpiMeter}/>,
        "appointments": <Appointments />,
        "sales-overview": <SalesOverview />,
        "invoices": <Invoices />,
        "revenue-analytics": <RevenueAnalytics />,
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
                        rowHeight={40}
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
