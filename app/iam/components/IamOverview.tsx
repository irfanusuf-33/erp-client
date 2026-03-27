"use client";
import { useState, useEffect } from "react";
import { ResponsiveGridLayout as RGL, useContainerWidth } from "react-grid-layout";
const ResponsiveGridLayout = RGL as any;
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import IamResources from "./blocks/IamResources";
import IamInsightsAlerts from "./blocks/IamInsightsAlerts";
import IamRecentActivity from "./blocks/IamRecentActivity";
import IamUserAccessOverview from "./blocks/IamUserAccessOverview";
import IamAccessRequests from "./blocks/IamAccessRequests";
import IamUsersByType from "./blocks/IamUsersByType";
import { useGlobalStore } from "@/store";

const defaultLayouts = {
  lg: [
    { i: "user-access-overview", x: 0, y: 0, w: 4, h: 8 },
    { i: "access-requests",      x: 4, y: 0, w: 4, h: 8 },
    { i: "insights-alerts",      x: 8, y: 0, w: 4, h: 8 },
    { i: "users-by-type",        x: 0, y: 8, w: 4, h: 8 },
    { i: "recent-activity",      x: 4, y: 8, w: 8, h: 8 },
  ],
};

export default function IamOverview() {
  const { fetchIamDashboard, IamdashboardData } = useGlobalStore();
  const [layouts, setLayouts] = useState(defaultLayouts);
  const { width, containerRef, mounted } = useContainerWidth();

  useEffect(() => { fetchIamDashboard(); }, []);

  const details = IamdashboardData;

  const components: Record<string, React.ReactNode> = {
    "user-access-overview": <IamUserAccessOverview details={details} />,
    "access-requests":      <IamAccessRequests />,
    "insights-alerts":      <IamInsightsAlerts alerts={details?.insightsAndAlerts?.alerts} insights={details?.insightsAndAlerts?.insights} />,
    "users-by-type":        <IamUsersByType userRolesCount={details?.userRolesCount} />,
    "recent-activity":      <IamRecentActivity />,
  };

  return (
    <div className="p-6 bg-white">
      <IamResources details={details} />
      <div ref={containerRef}>
        {mounted && (
          <ResponsiveGridLayout
            className="layout"
            width={width}
            layouts={layouts}
            onLayoutChange={(_: any, allLayouts: any) => setLayouts(allLayouts)}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            isDraggable
            isResizable
            margin={[16, 16]}
            containerPadding={[0, 0]}
            draggableHandle=".drag-handle"
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
