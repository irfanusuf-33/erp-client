<<<<<<< Updated upstream
export default function EmployeeListPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Employee List</h1>
      <p className="text-muted-foreground">Employee list coming soon...</p>
=======
import EmployeeListTable from "./EmployeeListTable";

export const metadata = {
  title: "Employee List",
};

export default function EmployeeListPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <h1 className="mb-5 text-xl font-semibold text-slate-800">
        Employee Profiles
      </h1>
      <EmployeeListTable />
>>>>>>> Stashed changes
    </div>
  );
}
