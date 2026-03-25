import IamNavbar from "./components/IamNavbar";

export default function IamLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IamNavbar />
      {children}
    </>
  );
}
