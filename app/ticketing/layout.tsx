import TicketingNavbar from "./components/Navbar";

export default function IamLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TicketingNavbar />
      {children}
    </>
  );
}
