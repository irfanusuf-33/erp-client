import { Input } from "@/components/ui/input";

interface PersonalFormData {
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
}

interface PersonalDetailsFormProps {
  formData: PersonalFormData;
  onInputChange: (field: keyof PersonalFormData, value: string) => void;
  errors?: Record<string, string>;
}

const genderOptions = [
  { value: "",       label: ""       },
  { value: "Male",   label: "Male"   },
  { value: "Female", label: "Female" },
  { value: "Other",  label: "Other"  },
];

const maritalStatusOptions = [
  { value: "",         label: "Select Category" },
  { value: "Single",   label: "Single"          },
  { value: "Married",  label: "Married"         },
  { value: "Divorced", label: "Divorced"        },
  { value: "Widowed",  label: "Widowed"         },
];

const bloodGroupOptions = [
  { value: "",    label: ""    },
  { value: "A+",  label: "A+"  },
  { value: "A-",  label: "A-"  },
  { value: "B+",  label: "B+"  },
  { value: "B-",  label: "B-"  },
  { value: "O+",  label: "O+"  },
  { value: "O-",  label: "O-"  },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
];

// ─── Reusable field wrapper ────────────────────────────────────────────────────

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

// ─── Native select styled to match the design ─────────────────────────────────

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
      className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm text-slate-700 shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
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

export default function PersonalDetailsForm({
  formData,
  onInputChange,
  errors,
}: PersonalDetailsFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-slate-700">Personal Details</h2>

      {/* Row 1 — 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        <Field label="First Name" error={errors?.firstName}>
          <Input
            placeholder="e.g. John"
            value={formData.firstName ?? ""}
            onChange={(e) => onInputChange("firstName", e.target.value)}
          />
        </Field>

        <Field label="Middle name">
          <Input
            value={formData.middleName ?? ""}
            onChange={(e) => onInputChange("middleName", e.target.value)}
          />
        </Field>

        <Field label="Last Name" error={errors?.lastName}>
          <Input
            value={formData.lastName ?? ""}
            onChange={(e) => onInputChange("lastName", e.target.value)}
          />
        </Field>
      </div>

      {/* Row 2 — 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Father's Name">
          <Input
            value={formData.fatherName ?? ""}
            onChange={(e) => onInputChange("fatherName", e.target.value)}
          />
        </Field>

        <Field label="Mother's Name">
          <Input
            value={formData.motherName ?? ""}
            onChange={(e) => onInputChange("motherName", e.target.value)}
          />
        </Field>
      </div>

      {/* Row 3 — Gender | Marital Status */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Gender" error={errors?.gender}>
          <NativeSelect
            value={formData.gender ?? ""}
            onChange={(v) => onInputChange("gender", v)}
            options={genderOptions}
          />
        </Field>

        <Field label="Marital Status">
          <NativeSelect
            value={formData.maritalStatus ?? ""}
            onChange={(v) => onInputChange("maritalStatus", v)}
            options={maritalStatusOptions}
          />
        </Field>
      </div>

      {/* Row 4 — Date of Birth | Age */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date of Birth" error={errors?.DateOfBirth}>
          <Input
            type="date"
            value={formData.DateOfBirth ?? ""}
            onChange={(e) => onInputChange("DateOfBirth", e.target.value)}
          />
        </Field>

        <Field label="Age">
          <Input
            type="number"
            value={formData.age ?? ""}
            onChange={(e) => onInputChange("age", e.target.value)}
          />
        </Field>
      </div>

      {/* Row 5 — Occupation | Blood Group */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Occupation">
          <Input
            value={formData.occupation ?? ""}
            onChange={(e) => onInputChange("occupation", e.target.value)}
          />
        </Field>

        <Field label="Blood Group">
          <NativeSelect
            value={formData.bloodGroup ?? ""}
            onChange={(v) => onInputChange("bloodGroup", v)}
            options={bloodGroupOptions}
          />
        </Field>
      </div>
    </div>
  );
}