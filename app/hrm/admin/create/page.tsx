<<<<<<< Updated upstream
export default function CreateEmployeePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Create Employee</h1>
      <p className="text-muted-foreground">Employee creation form coming soon...</p>
    </div>
  );
}
=======
"use client";

import EmployeeCreationForm from "./EmployeeCreationForm";

export default function CreateEmployeePage() {
  return (
    <div className="p-6">
      <EmployeeCreationForm />
    </div>
  );
}
>>>>>>> Stashed changes
