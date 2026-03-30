import { Suspense } from "react";
import CrmNavbar from "./components/CrmNavbar";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <>


      {/* crm navbar */}
      <CrmNavbar />

      
      <Suspense fallback = {<div>Loading....</div>}> 
      {children}
      </Suspense>
    </>
  );
}
