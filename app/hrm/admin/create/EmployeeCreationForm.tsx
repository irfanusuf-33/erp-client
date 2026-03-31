"use client";

import { useState } from "react";
import { Stepper, Step, StepLabel } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { Button } from "@/components/ui/button";
import PersonalDetailsForm from "./PersonalDetailsForm";
import OrganizationalDetailsForm from "./OrganizationalDetailsForm";
import AddressDetailsForm from "./AddressDetailsForm";
import ContactDetailsForm from "./ContactDetails";
import BankDetailsForm from "./BankDetailsForm";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fatherName?: string;
  motherName?: string;
  gender?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  DateOfBirth?: string;
  age?: string;
  occupation?: string;
  employeeId?: string;
  departmentName?: string;
  designation?: string;
  jobTitle?: string;
  employeeType?: string;
  lineManager?: string;
  buildingNo?: string;
  streetNumber?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  email?: string;
  phone?: string;
  secondaryEmail?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  relationshipToEmployee?: string;
  bankName?: string;
  accountNumber?: string;
  ifscSwiftCode?: string;
}

// ─── Step config ───────────────────────────────────────────────────────────────

const steps = [
  { label: "Personal Details",       icon: <PersonIcon />         },
  { label: "Organizational Details", icon: <BusinessIcon />       },
  { label: "Address Details",        icon: <LocationOnIcon />     },
  { label: "Contact Details",        icon: <ContactPhoneIcon />   },
  { label: "ID's & Bank Details",    icon: <AccountBalanceIcon /> },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function EmployeeCreationForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const renderStep = () => {
    switch (activeStep) {
      case 0: return <PersonalDetailsForm       formData={formData} onInputChange={handleInputChange} errors={errors} />;
      case 1: return <OrganizationalDetailsForm formData={formData} onInputChange={handleInputChange} errors={errors} />;
      case 2: return <AddressDetailsForm        formData={formData} onInputChange={handleInputChange} errors={errors} />;
      case 3: return <ContactDetailsForm        formData={formData} onInputChange={handleInputChange} errors={errors} />;
      case 4: return <BankDetailsForm           formData={formData} onInputChange={handleInputChange} errors={errors} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50 min-h-screen">

      <h1 className="text-xl font-semibold text-slate-800">
        Employee Creation Form
      </h1>

     <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6"><Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel icon={step.icon}>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper></div>
      
      

      {/* ── Form card — below stepper ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">

        {/* Form content */}
        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {activeStep !== 0 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button variant="default">Submit</Button>
          ) : (
            <Button variant="default" onClick={handleNext}>
              Next
            </Button>
          )}
        </div>

      </div>

    </div>
  );
}