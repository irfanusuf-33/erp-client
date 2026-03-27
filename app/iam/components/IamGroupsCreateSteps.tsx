"use client";
import { useState } from "react";
import IamGroupsCreate from "./IamGroupsCreate";
import IamGroupPermissions from "./IamGroupPermissions";
import IamReviewGroup from "./IamReviewGroup";

export default function IamGroupsCreateSteps() {
  const [view, setView] = useState(1);
  const [formData, setFormData] = useState({ name: "", admin: "", code: "", description: "", policies: [] as string[], adminName: "", files: undefined as any, rawFiles: undefined as any });

  return (
    <div>
      {view === 1 && <IamGroupsCreate setView={setView} formData={formData} setFormData={setFormData} />}
      {view === 2 && <IamGroupPermissions setView={setView} formData={formData} setFormData={setFormData} />}
      {view === 3 && <IamReviewGroup setView={setView} formData={formData} />}
    </div>
  );
}
