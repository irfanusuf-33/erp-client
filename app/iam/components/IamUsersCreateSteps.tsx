"use client";
import { useState } from "react";
import IamUsersCreate from "./IamUsersCreate";
import IamUserPermissions from "./IamUserPermissions";
import IamReviewUser from "./IamReviewUser";

export default function IamUsersCreateSteps() {
  const [view, setView] = useState(1);
  const [formData, setFormData] = useState({ fName: "", lName: "", email: "", username: "", pwd: "", policies: [] as string[], roles: [] as string[], groups: [] as string[] });

  return (
    <div>
      {view === 1 && <IamUsersCreate setView={setView} formData={formData} setFormData={setFormData} />}
      {view === 2 && <IamUserPermissions setView={setView} formData={formData} setFormData={setFormData} />}
      {view === 3 && <IamReviewUser setView={setView} formData={formData} />}
    </div>
  );
}
