"use client";

// app/hrm/admin/employee/[id]/page.tsx

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MoreVertical, User } from "lucide-react";
import { useGlobalStore } from "@/store";
import { EmployeeListItem } from "@/types/hrm.types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmployeeDetail {
  _id: string;
  status?: "Active" | "Inactive";
  location?: string;
  workAllocation?: string;
  designation?: string;
  email?: string;

  personalDetails: {
    firstName: string;
    middleName?: string;
    lastName: string;
    fatherName?: string;
    motherName?: string;
    gender?: string;
    maritalStatus?: string;
    dob?: string;
    age?: string;
    occupation?: string;
    bloodGroup?: string;
  };

  organizationalDetails: {
    employeeId: string;
    departmentName?: string;
    grade?: string;
    gradeP?: string;
    designation?: string;
    jobTitle?: string;
    employeeType?: string;
    lineManager?: string;
    teamLead?: string;
    client?: string;
    organizationName?: string;
    level?: string;
    employeeStatus?: string;
    cab?: string;
  };

  addressDetails?: {
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    postOffice?: string;
    buildingName?: string;
    streetNumber?: string;
  };

  contactDetails?: {
    primaryEmail?: string;
    secondaryEmail?: string;
    phoneNumber?: string;
    emergencyContactNumber?: string;
    emergencyContactName?: string;
    employeeType?: string;
  };

  idBankDetails?: {
    govIdType1?: string;
    govIdNumber1?: string;
    govIdType2?: string;
    govIdNumber2?: string;
    taxId?: string;
    nationalId?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankBranch?: string;
  };
}

type FetchState =
  | { status: "loading"; data: null }
  | { status: "success"; data: EmployeeDetail }
  | { status: "error"; data: null };

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS = [
  "Personal Details",
  "Organizational Details",
  "Address Details",
  "Contact Details",
  "ID & Bank Details",
] as const;

type Tab = (typeof TABS)[number];

const dummyEmployee: EmployeeDetail = {
  _id: "1",
  status: "Active",
  location: "Srinagar",
  workAllocation: "Frontend Development",
  designation: "Software Engineer",
  email: "dakota@example.com",

  personalDetails: {
    firstName: "Dakota",
    middleName: "A",
    lastName: "Nasir",
    fatherName: "Abdul Nasir",
    motherName: "Fatima Nasir",
    gender: "Male",
    maritalStatus: "Single",
    dob: "1998-05-12",
    age: "27",
    occupation: "Engineer",
    bloodGroup: "B+",
  },

  organizationalDetails: {
    employeeId: "EMP001",
    departmentName: "Engineering",
    grade: "G5",
    gradeP: "2024-2025",
    designation: "Software Engineer",
    jobTitle: "Frontend Developer",
    employeeType: "Full Time",
    lineManager: "Ali Khan",
    teamLead: "Sarah Ahmed",
    client: "Internal",
    organizationName: "Tech Corp",
    level: "L2",
    employeeStatus: "Active",
    cab: "Yes",
  },

  addressDetails: {
    country: "India",
    state: "Jammu & Kashmir",
    city: "Srinagar",
    postalCode: "190001",
    postOffice: "Lal Chowk",
    buildingName: "Green Heights",
    streetNumber: "12A",
  },

  contactDetails: {
    primaryEmail: "dakota@example.com",
    secondaryEmail: "dakota.personal@example.com",
    phoneNumber: "9876543210",
    emergencyContactNumber: "9876500000",
    emergencyContactName: "Abdul Nasir",
    employeeType: "Full Time",
  },

  idBankDetails: {
    govIdType1: "Aadhar",
    govIdNumber1: "1234-5678-9123",
    govIdType2: "PAN",
    govIdNumber2: "ABCDE1234F",
    taxId: "TX123456",
    nationalId: "IND998877",
    bankName: "State Bank of India",
    accountNumber: "12345678901",
    ifscCode: "SBIN0001234",
    bankBranch: "Srinagar Main",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-700">{value || "N/A"}</span>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
      {children}
    </div>
  );
}

// ─── Tab Panels ──────────────────────────────────────────────────────────────

function PersonalDetails({ e }: { e: EmployeeDetail }) {
  const p = e.personalDetails;
  return (
    <>
      <h2 className="text-sm font-semibold text-slate-800 mb-5">Personal Details</h2>
      <FieldGrid>
        <Field label="First Name"      value={p.firstName} />
        <Field label="Middle Name"     value={p.middleName} />
        <Field label="Last Name"       value={p.lastName} />
        <Field label="Father's Name"   value={p.fatherName} />
        <Field label="Mother's Name"   value={p.motherName} />
        <Field label="Gender"          value={p.gender} />
        <Field label="Marital Status"  value={p.maritalStatus} />
        <Field label="Date of Birth"   value={p.dob} />
        <Field label="Age"             value={p.age} />
        <Field label="Occupation"      value={p.occupation} />
        <Field label="Blood Group"     value={p.bloodGroup} />
      </FieldGrid>
    </>
  );
}

function OrganizationalDetails({ e }: { e: EmployeeDetail }) {
  const o = e.organizationalDetails;
  return (
    <>
      <h2 className="text-sm font-semibold text-slate-800 mb-5">Organizational Details</h2>
      <FieldGrid>
        <Field label="Employee ID"       value={o.employeeId} />
        <Field label="Department"        value={o.departmentName} />
        <Field label="Grade"             value={o.grade} />
        <Field label="Designation"       value={o.designation} />
        <Field label="Job Title"         value={o.jobTitle} />
        <Field label="Employee type"     value={o.employeeType} />
        <Field label="Line Manager"      value={o.lineManager} />
        <Field label="Team Lead"         value={o.teamLead} />
        <Field label="Client"            value={o.client} />
        <Field label="Organization name" value={o.organizationName} />
        <Field label="Level"             value={o.level} />
        <Field label="Employee Status"   value={o.employeeStatus} />
        <Field label="Grade Period"      value={o.gradeP} />
        <Field label="CAB"               value={o.cab} />
      </FieldGrid>
    </>
  );
}

function AddressDetails({ e }: { e: EmployeeDetail }) {
  const a = e.addressDetails ?? {};
  return (
    <>
      <h2 className="text-sm font-semibold text-slate-800 mb-5">Address Details</h2>
      <FieldGrid>
        <Field label="Country"             value={a.country} />
        <Field label="State"               value={a.state} />
        <Field label="City"                value={a.city} />
        <Field label="Postal Code"         value={a.postalCode} />
        <Field label="Post Office"         value={a.postOffice} />
        <Field label="Building Name"       value={a.buildingName} />
        <Field label="Street Number/ Name" value={a.streetNumber} />
      </FieldGrid>
    </>
  );
}

function ContactDetails({ e }: { e: EmployeeDetail }) {
  const c = e.contactDetails ?? {};
  return (
    <>
      <h2 className="text-sm font-semibold text-slate-800 mb-5">Contact Details</h2>
      <FieldGrid>
        <Field label="Email"                    value={c.primaryEmail} />
        <Field label="Secondary Email"          value={c.secondaryEmail} />
        <Field label="Phone Number"             value={c.phoneNumber} />
        <Field label="Emergency Contact Number" value={c.emergencyContactNumber} />
        <Field label="Emergency Contact Name"   value={c.emergencyContactName} />
        <Field label="Employee type"            value={c.employeeType} />
      </FieldGrid>
    </>
  );
}

function IdBankDetails({ e }: { e: EmployeeDetail }) {
  const b = e.idBankDetails ?? {};
  return (
    <>
      <h2 className="text-sm font-semibold text-slate-800 mb-5">ID &amp; Bank Details</h2>
      <FieldGrid>
        <Field label="Government ID Type 1"      value={b.govIdType1} />
        <Field label="Government ID Number 1"    value={b.govIdNumber1} />
        <Field label="Government ID Type 2"      value={b.govIdType2} />
        <Field label="Government ID Number 2"    value={b.govIdNumber2} />
        <Field label="Tax Identification Number" value={b.taxId} />
        <Field label="National ID Number"        value={b.nationalId} />
        <Field label="Bank Name"                 value={b.bankName} />
        <Field label="Account Number"            value={b.accountNumber} />
        <Field label="IFSC/Swift Code"           value={b.ifscCode} />
        <Field label="Bank Branch"               value={b.bankBranch} />
      </FieldGrid>
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("Personal Details");
  const [menuOpen, setMenuOpen] = useState(false);

  // Single state object — one setState call, no cascading renders
  const [fetchState] = useState<FetchState>({
  status: "success",
  data: dummyEmployee,
});
  const listItem = useGlobalStore((state) =>
    (state.employees as EmployeeListItem[])?.find((emp) => emp._id === id)
  );
  const fetchEmployeeById = useGlobalStore((state) => state.fetchEmployeeById);

 // eslint-disable-line react-hooks/exhaustive-deps

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick() { setMenuOpen(false); }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  // ── Derived header values ──
  const employee = fetchState.status === "success" ? fetchState.data : null;

  const fullName = employee
    ? `${employee.personalDetails.firstName} ${employee.personalDetails.lastName}`
    : listItem
    ? `${listItem.personalDetails.firstName} ${listItem.personalDetails.lastName}`
    : "";

  const designation = employee?.organizationalDetails?.designation ?? employee?.designation ?? "";
  const email       = employee?.contactDetails?.primaryEmail ?? employee?.email ?? "";
  const location    = employee?.location ?? "";
  const manager     = employee?.organizationalDetails?.lineManager ?? listItem?.organizationalDetails?.lineManager ?? "";
  const workAlloc   = employee?.workAllocation ?? "";
  const status      = employee?.status ?? "Active";

  // ── Early states ──
  if (fetchState.status === "loading" && !listItem) {
    return (
      <div className="p-6 flex flex-col gap-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 animate-pulse h-32" />
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 animate-pulse h-64" />
      </div>
    );
  }

  if (fetchState.status === "error") {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-slate-400">Employee not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">

      {/* ── Profile Header Card ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <User size={20} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800">{fullName}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                {designation && <span>{designation}</span>}
                {designation && email && <span className="text-slate-300">•</span>}
                {email && <span>{email}</span>}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={(ev) => { ev.stopPropagation(); setMenuOpen((v) => !v); }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg border border-slate-100 shadow-lg py-1 w-32">
                <button className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                  Edit
                </button>
                <button className="w-full text-left px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50 transition-colors">
                  Deactivate
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Location",        value: location },
            { label: "Manager",         value: manager },
            { label: "Work Allocation", value: workAlloc },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-slate-700">{value || "N/A"}</p>
            </div>
          ))}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Current Status</p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === "Active"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs + Content Card ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {fetchState.status === "loading" ? (
            <div className="flex flex-col gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
              ))}
            </div>
          ) : employee ? (
            <>
              {activeTab === "Personal Details"       && <PersonalDetails       e={employee} />}
              {activeTab === "Organizational Details" && <OrganizationalDetails e={employee} />}
              {activeTab === "Address Details"        && <AddressDetails        e={employee} />}
              {activeTab === "Contact Details"        && <ContactDetails        e={employee} />}
              {activeTab === "ID & Bank Details"      && <IdBankDetails         e={employee} />}
            </>
          ) : null}
        </div>
      </div>

    </div>
  );
}