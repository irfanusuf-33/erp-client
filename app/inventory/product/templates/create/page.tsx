"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Field {
  id: string;
  label: string;
  type: string;
}

interface Group {
  id: string;
  name: string;
  fields: Field[];
}

const FIELD_TYPES = ["text", "number", "date", "textarea", "checkbox"];

export default function CreateTemplate() {
  const router = useRouter();
  const { saveProductTemplate } = useGlobalStore();
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addGroup = () => {
    const id = `group-${Date.now()}`;
    setGroups((prev) => [...prev, { id, name: "", fields: [] }]);
  };

  const removeGroup = (groupId: string) =>
    setGroups((prev) => prev.filter((g) => g.id !== groupId));

  const updateGroupName = (groupId: string, name: string) =>
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, name } : g));

  const addField = (groupId: string) => {
    const fieldId = `field-${Date.now()}`;
    setGroups((prev) => prev.map((g) =>
      g.id === groupId ? { ...g, fields: [...g.fields, { id: fieldId, label: "", type: "text" }] } : g
    ));
  };

  const removeField = (groupId: string, fieldId: string) =>
    setGroups((prev) => prev.map((g) =>
      g.id === groupId ? { ...g, fields: g.fields.filter((f) => f.id !== fieldId) } : g
    ));

  const updateField = (groupId: string, fieldId: string, key: keyof Field, value: string) =>
    setGroups((prev) => prev.map((g) =>
      g.id === groupId ? { ...g, fields: g.fields.map((f) => f.id === fieldId ? { ...f, [key]: value } : f) } : g
    ));

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!templateName.trim()) newErrors.templateName = "Template name is required";
    if (groups.length === 0) newErrors.groups = "Add at least one group";
    groups.forEach((g, gi) => {
      if (!g.name.trim()) newErrors[`group-${gi}`] = "Group name is required";
      g.fields.forEach((f, fi) => {
        if (!f.label.trim()) newErrors[`field-${gi}-${fi}`] = "Field label is required";
      });
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    const templateData = {
      templateName: templateName.trim(),
      templateDesc: templateDesc.trim(),
      groups: groups.map((g) => ({
        groupName: g.name,
        fields: g.fields.map((f) => ({ label: f.label, type: f.type, id: f.id })),
      })),
    };
    const result = await saveProductTemplate(templateData);
    if (result.success) router.push("/inventory/product/templates");
    else setErrors({ submit: result.msg || "Failed to save template" });
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/inventory/product/templates")}>← Back</Button>
        <h1 className="text-2xl font-bold">Create Template</h1>
      </div>

      {/* Template Info */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Template Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Template Name <span className="text-red-500">*</span></label>
            <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. Electronics Template" />
            {errors.templateName && <p className="mt-1 text-xs text-red-500">{errors.templateName}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <Input value={templateDesc} onChange={(e) => setTemplateDesc(e.target.value)} placeholder="Optional description" />
          </div>
        </div>
      </div>

      {/* Groups */}
      {errors.groups && <p className="text-xs text-red-500">{errors.groups}</p>}
      {groups.map((group, gi) => (
        <div key={group.id} className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <label className="text-sm font-medium mb-1 block">Group Name <span className="text-red-500">*</span></label>
              <Input value={group.name} onChange={(e) => updateGroupName(group.id, e.target.value)} placeholder="e.g. Technical Specs" />
              {errors[`group-${gi}`] && <p className="mt-1 text-xs text-red-500">{errors[`group-${gi}`]}</p>}
            </div>
            <Button variant="destructive" size="sm" type="button" onClick={() => removeGroup(group.id)}>Remove Group</Button>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {group.fields.map((field, fi) => (
              <div key={field.id} className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Field Label <span className="text-red-500">*</span></label>
                  <Input value={field.label} onChange={(e) => updateField(group.id, field.id, "label", e.target.value)} placeholder="e.g. Voltage" />
                  {errors[`field-${gi}-${fi}`] && <p className="mt-1 text-xs text-red-500">{errors[`field-${gi}-${fi}`]}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Field Type</label>
                  <select className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm" value={field.type} onChange={(e) => updateField(group.id, field.id, "type", e.target.value)}>
                    {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <Button variant="destructive" size="sm" type="button" onClick={() => removeField(group.id, field.id)}>Remove</Button>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" type="button" onClick={() => addField(group.id)}>+ Add Field</Button>
        </div>
      ))}

      <Button variant="outline" size="sm" type="button" onClick={addGroup}>+ Add Group</Button>

      {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => router.push("/inventory/product/templates")}>Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Template"}</Button>
      </div>
    </div>
  );
}
