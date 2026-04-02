"use client";
import { useState, useEffect } from "react";
import { ResponsiveGridLayout, useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import ClientInfo from "../../components/ClientDetailComponents/ClientInfo";
import Test from "../../components/ClientDetailComponents/Test";
import ClientAddress from "../../components/ClientDetailComponents/ClientAddress";
import ClientContact from "../../components/ClientDetailComponents/ClientContact";
import ClientProductDetails from "../../components/ClientDetailComponents/ClientProductDetails";
import ClientFinancialInformation from "../../components/ClientDetailComponents/ClientFinancialDetail";
import ClientTicketStatus from "../../components/ClientDetailComponents/ClientTicketStatus";
import FollowUps from "../../components/ClientDetailComponents/FollowUps";
import ClientStats from "../../components/ClientDetailComponents/ClientStats";

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
        { i: "client-info", x: 0, y: 0, w: 3, h: 4, maxH : 7, minH: 1.3, minW: 2.5},
        { i: "client-enquiry", x: 3, y: 0, w: 5, h: 7.5, maxH: 12, minH: 1  , minW: 3 },
        { i: "ticket-status", x: 9, y: 0, w: 4, h: 6 , maxH: 10, minH: 1 , minW: 2.5},
        { i: "client-address", x: 0, y: 4, w: 3, h: 3.8 , maxH: 8, minH: 1 , minW: 2.5 },
        { i: "product-detail", x: 3, y: 7, w: 5, h: 5.8 , maxH: 11, minH: 1 , minW: 3},
        { i: "follow-ups",  x: 9, y: 3, w: 4, h: 4 , maxH: 9, minH: 1 , minW: 2.5},
        { i: "client-contact",x: 0, y: 7.8, w: 3, h: 3.8 , maxH: 8, minH: 1 , minW: 2.5 },
        { i: "financial-info", x: 3, y: 10, w: 5, h: 7 , maxH: 11, minH: 1 , minW: 3},
        { i: "client-stats", x: 9, y: 6, w: 4, h: 4 , maxH: 9, minH: 1 , minW: 2.5},
        { i: "documents", x: 0, y: 11.6, w: 3, h: 7.5 , maxH: 12, minH: 1 , minW: 2.5},
        { i: "subscription", x:3, y:17, w:5, h:7, maxH:11, minH:1, minW:2.5},
    ],
};

export default function CrmDashboard() {
    
    const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);

    const { width, containerRef, mounted } = useContainerWidth();

    const clientData = {
        clientInfo:   { name:"Abc", organizationId: '2536',phone:'567867345', email:'abc@gmail.com', website:'https://www.voctrum.com' },
        addressInfo: { postalCode: "134567", streetNumber:'45', streetName:'AB', city:'srinagar', country:'india' },
        contactInfo:{firstname:'abc', lastName:'def', email:'abc@gmail.com', phone:'567867345', social:'fgh'},
        
    }


    const components: Record<string, React.ReactNode> = {
        "client-info": <ClientInfo  clientData={clientData.clientInfo}/>,
        "client-enquiry": <Test />,
        "ticket-status": <ClientTicketStatus />,
        "client-address": <ClientAddress clientData={clientData.addressInfo} />,
        "product-detail": <ClientProductDetails/>,
        "follow-ups": <FollowUps />,
        "client-contact": <ClientContact clientData={clientData.contactInfo} />,
        "financial-info": <ClientFinancialInformation />,
        "client-stats": <ClientStats />,
        "documents": <Test />,
        "subscription": <Test />,
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
                        rowHeight={55}
                        {...{ isDraggable: true, isResizable: true, draggableHandle: ".drag-handle", }}
                        // isDraggable
                        // isResizable
                        margin={[16, 16]}
                        containerPadding={[0, 0]}
                    // draggableHandle=".drag-handle"
                    >
                        {Object.entries(components).map(([key, component]) => (
                            <div key={key} className="overflow-auto border border-gray-200 shadow-md rounded-xl">
                                {component}
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                )}
            </div>
        </div>
    );
}
