import InventoryNavbar from "./components/InventoryNavbar";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InventoryNavbar />
      {children}
    </>
  );
}
