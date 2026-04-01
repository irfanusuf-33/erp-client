"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, ChevronDown, Briefcase, CalendarDays } from "lucide-react";

type WorkWeek = "5" | "6";
type FieldType = "text"|"number"|"date"|"dropdown"|"checkbox"|"file"|"richtext"|"email"|"phone";

interface CustomField { id: string; label: string; type: FieldType; required: boolean; }
interface FormSection  { id: string; name: string; icon: string; fields: CustomField[]; isOpen: boolean; }

const FIVE_DAY_IDS = ["monday","tuesday","wednesday","thursday","friday"];
const SIX_DAY_IDS  = ["monday","tuesday","wednesday","thursday","friday","saturday"];
const ALL_DAYS = [
  { id:"monday",    short:"Mon" }, { id:"tuesday",   short:"Tue" },
  { id:"wednesday", short:"Wed" }, { id:"thursday",  short:"Thu" },
  { id:"friday",    short:"Fri" }, { id:"saturday",  short:"Sat" },
  { id:"sunday",    short:"Sun" },
];

const FIELD_TYPES: { value: FieldType; label: string; icon: string }[] = [
  { value:"text",     label:"Text",        icon:"T"  },
  { value:"number",   label:"Number",      icon:"#"  },
  { value:"date",     label:"Date",        icon:"📅" },
  { value:"email",    label:"Email",       icon:"@"  },
  { value:"phone",    label:"Phone",       icon:"☎"  },
  { value:"dropdown", label:"Dropdown",    icon:"▾"  },
  { value:"checkbox", label:"Checkbox",    icon:"☑"  },
  { value:"file",     label:"File Upload", icon:"↑"  },
  { value:"richtext", label:"Rich Text",   icon:"¶"  },
];

const INITIAL_FORMS: FormSection[] = [
  { id:"personal",   name:"Personal Information", icon:"👤", isOpen:false, fields:[
    { id:"f1", label:"Full Name",     type:"text",     required:true  },
    { id:"f2", label:"Date of Birth", type:"date",     required:true  },
    { id:"f3", label:"Phone Number",  type:"phone",    required:false },
  ]},
  { id:"employment", name:"Employment Details",   icon:"💼", isOpen:false, fields:[
    { id:"f4", label:"Job Title",     type:"text",     required:true  },
    { id:"f5", label:"Department",    type:"dropdown", required:true  },
    { id:"f6", label:"Start Date",    type:"date",     required:true  },
  ]},
  { id:"documents",  name:"Documents & Files",    icon:"📄", isOpen:false, fields:[
    { id:"f7", label:"Resume",        type:"file",     required:false },
    { id:"f8", label:"ID Proof",      type:"file",     required:true  },
  ]},
  { id:"emergency",  name:"Emergency Contact",    icon:"🚨", isOpen:false, fields:[] },
  { id:"banking",    name:"Banking Details",      icon:"🏦", isOpen:false, fields:[] },
  { id:"onboarding", name:"Onboarding Checklist", icon:"✅", isOpen:false, fields:[] },
];

let _uid = 100;
const uid = () => `f_${++_uid}`;

// ── FieldRow ──────────────────────────────────────────────────────────────────
function FieldRow({ field, onDelete, onToggleRequired, onLabelChange }: {
  field: CustomField;
  onDelete: () => void;
  onToggleRequired: () => void;
  onLabelChange: (v: string) => void;
}) {
  const info = FIELD_TYPES.find(x => x.value === field.type)!;
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 group">
      <span className="text-slate-300 cursor-grab">
        <GripVertical size={15} />
      </span>
      <span className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 text-slate-500 text-xs font-medium shrink-0">
        {info.icon}
      </span>
      <input
        className="flex-1 text-sm text-slate-700 bg-transparent border-0 outline-none placeholder:text-slate-400 min-w-0"
        value={field.label}
        onChange={e => onLabelChange(e.target.value)}
        placeholder="Field label…"
      />
      <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">{info.label}</span>
      <button
        onClick={onToggleRequired}
        className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap transition-colors ${
          field.required
            ? "border-blue-200 bg-blue-50 text-blue-600"
            : "border-slate-200 text-slate-400 hover:border-slate-300"
        }`}
      >
        {field.required ? "Required" : "Optional"}
      </button>
      <button
        onClick={onDelete}
        className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ── AddFieldBar ───────────────────────────────────────────────────────────────
function AddFieldBar({ onAdd }: { onAdd: (t: FieldType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-blue-500 font-medium hover:text-blue-600 transition-colors py-2"
      >
        <Plus size={13} /> Add field
      </button>
      {open && (
        <div className="absolute left-0 top-8 z-10 w-48 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {FIELD_TYPES.map(ft => (
            <button
              key={ft.value}
              onClick={() => { onAdd(ft.value); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left"
            >
              <span className="w-5 text-center text-slate-400 text-xs">{ft.icon}</span>
              {ft.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FormAccordion ─────────────────────────────────────────────────────────────
function FormAccordion({ section, onToggle, onAddField, onDeleteField, onToggleRequired, onLabelChange }: {
  section: FormSection;
  onToggle: () => void;
  onAddField: (t: FieldType) => void;
  onDeleteField: (id: string) => void;
  onToggleRequired: (id: string) => void;
  onLabelChange: (id: string, v: string) => void;
}) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
      >
        <span className="text-base">{section.icon}</span>
        <span className="flex-1 text-sm font-medium text-slate-700">{section.name}</span>
        <span className="text-xs text-slate-400 mr-2">
          {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${section.isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {section.isOpen && (
        <div className="bg-slate-50/50">
          {section.fields.length === 0 && (
            <p className="px-4 py-3 text-xs text-slate-400 italic">
              No fields yet — add your first field below.
            </p>
          )}
          {section.fields.map(f => (
            <FieldRow
              key={f.id}
              field={f}
              onDelete={() => onDeleteField(f.id)}
              onToggleRequired={() => onToggleRequired(f.id)}
              onLabelChange={v => onLabelChange(f.id, v)}
            />
          ))}
          <div className="px-4 py-1">
            <AddFieldBar onAdd={onAddField} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── WeekCard ──────────────────────────────────────────────────────────────────
function WeekCard({ value, selected, onSelect }: {
  value: WorkWeek; selected: boolean; onSelect: () => void;
}) {
  const is5 = value === "5";
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className={`p-2 rounded-lg ${selected ? "bg-blue-100" : "bg-slate-100"}`}>
        {is5
          ? <Briefcase size={18} className={selected ? "text-blue-500" : "text-slate-400"} />
          : <CalendarDays size={18} className={selected ? "text-blue-500" : "text-slate-400"} />
        }
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${selected ? "text-blue-700" : "text-slate-700"}`}>
          {value}-Day Week
        </p>
        <p className="text-xs text-slate-400">{is5 ? "Monday – Friday" : "Monday – Saturday"}</p>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        selected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
      }`}>
        {is5 ? "Standard" : "Extended"}
      </span>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? "border-blue-500" : "border-slate-300"
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
      </div>
    </div>
  );
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
function SectionLabel({ label, mt }: { label: string; mt?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider ${mt ? "mt-6" : ""} mb-3`}>
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
      {label}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Settings() {
  const [workWeek, setWorkWeek] = useState<WorkWeek>("5");
  const [forms,    setForms]    = useState<FormSection[]>(INITIAL_FORMS);

  const toggleAccordion = (id: string) =>
    setForms(f => f.map(s => ({ ...s, isOpen: s.id === id ? !s.isOpen : s.isOpen })));
  const addField = (sid: string, type: FieldType) =>
    setForms(f => f.map(s => s.id !== sid ? s : { ...s, fields: [...s.fields, { id: uid(), label: "", type, required: false }] }));
  const deleteField = (sid: string, fid: string) =>
    setForms(f => f.map(s => s.id !== sid ? s : { ...s, fields: s.fields.filter(x => x.id !== fid) }));
  const toggleRequired = (sid: string, fid: string) =>
    setForms(f => f.map(s => s.id !== sid ? s : { ...s, fields: s.fields.map(x => x.id !== fid ? x : { ...x, required: !x.required }) }));
  const updateLabel = (sid: string, fid: string, v: string) =>
    setForms(f => f.map(s => s.id !== sid ? s : { ...s, fields: s.fields.map(x => x.id !== fid ? x : { ...x, label: v }) }));

  const activeDays = workWeek === "6" ? SIX_DAY_IDS : FIVE_DAY_IDS;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xl font-semibold text-slate-800">HRM Settings</p>
          <p className="text-sm text-slate-500 mt-1">
            Configure your organisation working preferences and form structure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Reset
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>

      {/* Working Week */}
      <SectionLabel label="Working Week" />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-2">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Working Week</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose how many days per week your organisation operates
          </p>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <WeekCard value="5" selected={workWeek === "5"} onSelect={() => setWorkWeek("5")} />
            <WeekCard value="6" selected={workWeek === "6"} onSelect={() => setWorkWeek("6")} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ALL_DAYS.map(d => (
              <span
                key={d.id}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeDays.includes(d.id)
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                {d.short}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form Builder */}
      <SectionLabel label="Form Fields" mt />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Form Builder</p>
          <p className="text-xs text-slate-400 mt-0.5">Customise fields for each HR form.</p>
        </div>
        <div>
          {forms.map(s => (
            <FormAccordion
              key={s.id}
              section={s}
              onToggle={() => toggleAccordion(s.id)}
              onAddField={type => addField(s.id, type)}
              onDeleteField={fid => deleteField(s.id, fid)}
              onToggleRequired={fid => toggleRequired(s.id, fid)}
              onLabelChange={(fid, v) => updateLabel(s.id, fid, v)}
            />
          ))}
        </div>
      </div>

    </div>
  );
}