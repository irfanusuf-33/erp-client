import { Input } from "@/components/ui/input";

interface OrganizationalFormData {
  employeeId?: string;
  departmentName?: string;
  gradePosition?: string;
  designation?: string;
  jobTitle?: string;
  employeeType?: string;
  lineManager?: string;
  teamLeader?: string;
  client?: string;
  organizationName?: string;
  level?: string;
  employmentStatus?: string;
  gradePeriod?: string;
  cab?: string;
}

interface OrganizationalDetailsFormProps {
  formData: OrganizationalFormData;
  onInputChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

// ─── Options ───────────────────────────────────────────────────────────────────

const departmentOptions = [
  { value: "",        label: ""           },
  { value: "hr",      label: "HR"         },
  { value: "it",      label: "IT"         },
  { value: "finance", label: "Finance"    },
  { value: "ops",     label: "Operations" },
];

const gradeOptions = [
  { value: "", label: "" },
  { value: "l1", label: "L1" },
  { value: "l2", label: "L2" },
  { value: "l3", label: "L3" },
];

const designationOptions = [
  { value: "",          label: ""             },
  { value: "engineer",  label: "Engineer"     },
  { value: "manager",   label: "Manager"      },
  { value: "director",  label: "Director"     },
  { value: "analyst",   label: "Analyst"      },
];

const jobTitleOptions = [
  { value: "",                label: ""                    },
  { value: "software_eng",    label: "Software Engineer"   },
  { value: "product_manager", label: "Product Manager"     },
  { value: "data_analyst",    label: "Data Analyst"        },
];

const employeeTypeOptions = [
  { value: "",          label: "Select Employment type" },
  { value: "full_time", label: "Full Time"              },
  { value: "part_time", label: "Part Time"              },
  { value: "contract",  label: "Contract"               },
  { value: "intern",    label: "Intern"                  },
];

const lineManagerOptions = [
  { value: "", label: "" },
  { value: "mgr1", label: "Manager 1" },
  { value: "mgr2", label: "Manager 2" },
];

const teamLeaderOptions = [
  { value: "", label: "" },
  { value: "tl1", label: "Team Lead 1" },
  { value: "tl2", label: "Team Lead 2" },
];

const clientOptions = [
  { value: "", label: "" },
  { value: "client1", label: "Client 1" },
  { value: "client2", label: "Client 2" },
];

const levelOptions = [
  { value: "",     label: ""        },
  { value: "jr",   label: "Junior"  },
  { value: "mid",  label: "Mid"     },
  { value: "sr",   label: "Senior"  },
];

const employmentStatusOptions = [
  { value: "",         label: ""          },
  { value: "active",   label: "Active"    },
  { value: "inactive", label: "Inactive"  },
  { value: "on_leave", label: "On Leave"  },
];

const gradePeriodOptions = [
  { value: "",         label: ""           },
  { value: "monthly",  label: "Monthly"    },
  { value: "quarterly",label: "Quarterly"  },
  { value: "annual",   label: "Annual"     },
];

const cabOptions = [
  { value: "",    label: ""    },
  { value: "yes", label: "Yes" },
  { value: "no",  label: "No"  },
];

// ─── Reusable components ───────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-500">{label}</label>
      {children}
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm text-slate-700 shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 appearance-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        paddingRight: "2rem",
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function OrganizationalDetailsForm({
  formData,
  onInputChange,
  errors,
}: OrganizationalDetailsFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-slate-700">Organizational Details</h2>

      {/* Row 1 — Employee ID | Department */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Employee ID" error={errors?.employeeId}>
          <Input
            value={formData.employeeId ?? ""}
            onChange={(e) => onInputChange("employeeId", e.target.value)}
          />
        </Field>

        <Field label="Department" error={errors?.departmentName}>
          <NativeSelect
            value={formData.departmentName ?? ""}
            onChange={(v) => onInputChange("departmentName", v)}
            options={departmentOptions}
          />
        </Field>
      </div>

      {/* Row 2 — Grade/Position | Designation */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Grade/Position">
          <NativeSelect
            value={formData.gradePosition ?? ""}
            onChange={(v) => onInputChange("gradePosition", v)}
            options={gradeOptions}
          />
        </Field>

        <Field label="Designation">
          <NativeSelect
            value={formData.designation ?? ""}
            onChange={(v) => onInputChange("designation", v)}
            options={designationOptions}
          />
        </Field>
      </div>

      {/* Row 3 — Job Title | Employee Type */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Job Title">
          <NativeSelect
            value={formData.jobTitle ?? ""}
            onChange={(v) => onInputChange("jobTitle", v)}
            options={jobTitleOptions}
          />
        </Field>

        <Field label="Employee Type">
          <NativeSelect
            value={formData.employeeType ?? ""}
            onChange={(v) => onInputChange("employeeType", v)}
            options={employeeTypeOptions}
          />
        </Field>
      </div>

      {/* Row 4 — Line Manager | Team Leader */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Line Manager">
          <NativeSelect
            value={formData.lineManager ?? ""}
            onChange={(v) => onInputChange("lineManager", v)}
            options={lineManagerOptions}
          />
        </Field>

        <Field label="Team Leader">
          <NativeSelect
            value={formData.teamLeader ?? ""}
            onChange={(v) => onInputChange("teamLeader", v)}
            options={teamLeaderOptions}
          />
        </Field>
      </div>

      {/* Row 5 — Client | Organization Name */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Client">
          <NativeSelect
            value={formData.client ?? ""}
            onChange={(v) => onInputChange("client", v)}
            options={clientOptions}
          />
        </Field>

        <Field label="Organization Name">
          <Input
            value={formData.organizationName ?? ""}
            onChange={(e) => onInputChange("organizationName", e.target.value)}
          />
        </Field>
      </div>

      {/* Row 6 — Level | Employment Status */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Level">
          <NativeSelect
            value={formData.level ?? ""}
            onChange={(v) => onInputChange("level", v)}
            options={levelOptions}
          />
        </Field>

        <Field label="Employment Status">
          <NativeSelect
            value={formData.employmentStatus ?? ""}
            onChange={(v) => onInputChange("employmentStatus", v)}
            options={employmentStatusOptions}
          />
        </Field>
      </div>

      {/* Row 7 — Grade Period | Cab */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Grade Period">
          <NativeSelect
            value={formData.gradePeriod ?? ""}
            onChange={(v) => onInputChange("gradePeriod", v)}
            options={gradePeriodOptions}
          />
        </Field>

        <Field label="Cab">
          <NativeSelect
            value={formData.cab ?? ""}
            onChange={(v) => onInputChange("cab", v)}
            options={cabOptions}
          />
        </Field>
      </div>
    </div>
  );
}