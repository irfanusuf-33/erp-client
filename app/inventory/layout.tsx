import { Suspense } from "react";
import InventoryNavbar from "./components/InventoryNavbar";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InventoryNavbar />
      <Suspense fallback = {<div>Loading....</div>}> 
      {children}
      </Suspense>
    </>
  );
}
