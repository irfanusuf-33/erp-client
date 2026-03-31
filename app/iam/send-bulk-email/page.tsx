"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Paperclip, Info } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import type { Template } from "@/types/iam.types";

const CKEditorWrapper = dynamic(() => import("../components/CKEditorWrapper"), { ssr: false });

function SendBulkEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [header, setHeader] = useState("");
  const [footer, setFooter] = useState("");
  const [showHeaderFooter, setShowHeaderFooter] = useState(false);
  const [attachPdf, setAttachPdf] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [customFieldName, setCustomFieldName] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");
  const [customFields, setCustomFields] = useState<{ name: string; value: string }[]>([]);

  const filteredVariables = customFields.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    axiosInstance.get("/iam/email-templates").then((res) => {
      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTemplates(arr.map((t: any) => ({ id: t._id, name: t.name, subject: t.subject, content: t.body || t.template || "", header: t.header || "", footer: t.footer || "" })));
    }).catch(() => {});
  }, []);

  if (!groupId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Group Selected</h2>
          <p className="text-gray-500 mb-4">Please select a group before sending bulk emails.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const loadTemplate = (tmpl: Template) => {
    setSelectedTemplate(tmpl);
    setSubject(tmpl.subject);
    setBody(tmpl.content);
    setHeader(tmpl.header || "");
    setFooter(tmpl.footer || "");
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setIsLoading(true);
    try {
      await axiosInstance.post("/iam/groups/bulk-email", { groupId, subject, template: body, header: showHeaderFooter ? header : "", footer: showHeaderFooter ? footer : "" });
      router.back();
    } catch {}
    setIsLoading(false);
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) return;
    setIsSavingTemplate(true);
    try {
      await axiosInstance.post("/iam/email-templates", { name: newTemplateName, subject, template: body, header, footer });
      setShowTemplateModal(false); setNewTemplateName("");
    } catch {}
    setIsSavingTemplate(false);
  };

  const handleSaveCustomField = () => {
    if (!customFieldName.trim() || !customFieldValue.trim()) return;
    setCustomFields((p) => [...p, { name: customFieldName, value: `{{${customFieldValue}}}` }]);
    setCustomFieldName(""); setCustomFieldValue(""); setShowCustomFieldModal(false);
  };

  const handleDragStart = (e: React.DragEvent, variable: { name: string; value: string }) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("variable", variable.value);
  };

  const handleDrop = (e: React.DragEvent, target: "header" | "body" | "footer") => {
    e.preventDefault();
    const variable = e.dataTransfer.getData("variable");
    if (!variable) return;
    if (target === "header") setHeader((p) => p + variable);
    else if (target === "body") setBody((p) => p + variable);
    else setFooter((p) => p + variable);
  };

  const previewHtml = `<!doctype html><html><head><meta charset="utf-8"/><style>html,body{margin:0;padding:0;background:#f6f8fb;font-family:Arial,sans-serif;color:#0f172a;}.wrap{max-width:980px;margin:16px auto;background:#fff;border:1px solid #dbe3ef;border-radius:8px;overflow:hidden;}.content{padding:16px;overflow-wrap:anywhere;word-break:break-word;}.content img,.content table{max-width:100%!important;height:auto!important;}</style></head><body><div class="wrap"><div class="content">${[showHeaderFooter && header, body, showHeaderFooter && footer].filter(Boolean).join("<br/>")}</div></div></body></html>`;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Send Bulk Email</h1>
      <div className="flex gap-6">
        <div className="flex-1 flex flex-col gap-4 border border-gray-200 rounded-lg bg-white p-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Template Name</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm focus:outline-none focus:border-ring"
              onChange={(e) => { const t = templates.find((x) => x.id === e.target.value); if (t) loadTemplate(t); }}
              value={selectedTemplate?.id || ""}
            >
              <option value="">Select Template</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="Default email subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showHeaderFooter} onChange={(e) => setShowHeaderFooter(e.target.checked)} />
              Show Header/Footer
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={attachPdf} onChange={(e) => { setAttachPdf(e.target.checked); if (!e.target.checked) setPdfFiles([]); }} />
              Attach Files
            </label>
          </div>

          {attachPdf && (
            <div className="flex flex-col gap-1">
              <Button type="button" variant="outline" className="w-fit flex items-center gap-1"
                onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = ".pdf"; i.multiple = true; i.onchange = (e: any) => setPdfFiles((p) => [...p, ...Array.from<File>(e.target.files || [])]); i.click(); }}>
                <Paperclip size={16} />Select Files
              </Button>
              {pdfFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm">{f.name}</span>
                  <button onClick={() => setPdfFiles((p) => p.filter((_, j) => j !== i))} className="text-red-500 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}

          {showHeaderFooter && (
            <div className="flex flex-col gap-1" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "header")}>
              <label className="text-sm font-medium">Header</label>
              <div className="border border-input rounded-md overflow-hidden [&_.ck-editor__editable]:min-h-[120px]">
                <CKEditorWrapper value={header} onChange={setHeader} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "body")}>
            <label className="text-sm font-medium">Body</label>
            <div className="border border-input rounded-md overflow-hidden [&_.ck-editor__editable]:min-h-64">
              <CKEditorWrapper value={body} onChange={setBody} />
            </div>
          </div>

          {showHeaderFooter && (
            <div className="flex flex-col gap-1" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "footer")}>
              <label className="text-sm font-medium">Footer</label>
              <div className="border border-input rounded-md overflow-hidden [&_.ck-editor__editable]:min-h-[120px]">
                <CKEditorWrapper value={footer} onChange={setFooter} />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowTemplateModal(true)}>Save as template</Button>
            <Button variant="outline" onClick={() => setShowPreviewModal(true)} disabled={!subject.trim() || !body.trim()}>Preview</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSend} disabled={!subject.trim() || !body.trim() || isLoading}>{isLoading ? "Sending..." : "Send"}</Button>
          </div>
        </div>

        <div className="w-80 flex flex-col gap-4 border border-gray-200 rounded-lg bg-white p-5 self-start">
          <h2 className="font-semibold text-base">Template Fields</h2>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-gray-300"
          />

          <div className="flex flex-col gap-1 min-h-[40px]">
            {filteredVariables.length > 0 ? filteredVariables.map((v, i) => (
              <div key={i} draggable onDragStart={(e) => handleDragStart(e, v)}
                className="flex items-center justify-between px-3 py-2 rounded border border-gray-200 bg-white cursor-grab hover:bg-gray-50 text-sm">
                <span>{v.name}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )) : (
              <p className="text-sm text-amber-600 text-center py-1">No fields found</p>
            )}
          </div>

          <hr className="border-gray-200" />

          <button
            onClick={() => setShowCustomFieldModal(true)}
            className="w-full rounded-lg border border-blue-500 text-blue-600 text-sm font-medium py-2.5 hover:bg-blue-50 transition-colors"
          >
            + Create Custom Field
          </button>

          <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-3">
            <Info size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
            <p className="text-xs text-blue-600 leading-snug">Drag and drop fields into your template editor to include dynamic content.</p>
          </div>
        </div>
      </div>

      <Dialog open={showPreviewModal} onOpenChange={(open) => { if (!open) setShowPreviewModal(false); }}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle>Email Preview</DialogTitle></DialogHeader>
          <div className="overflow-auto flex-1 flex flex-col gap-2">
            <div className="text-sm"><span className="font-medium">Subject:</span> {subject || "-"}</div>
            <div className="text-sm"><span className="font-medium">Attachments:</span> {pdfFiles.length > 0 ? pdfFiles.map((f) => f.name).join(", ") : "None"}</div>
            <iframe title="Email Preview" className="w-full flex-1 min-h-[400px] border rounded" srcDoc={previewHtml} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowPreviewModal(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplateModal} onOpenChange={(open) => { if (!open) setShowTemplateModal(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Name Your Template</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Template name</label>
            <Input placeholder="Enter template name" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateModal(false)} disabled={isSavingTemplate}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveTemplate} disabled={isSavingTemplate || !newTemplateName.trim()}>{isSavingTemplate ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCustomFieldModal} onOpenChange={(open) => { if (!open) setShowCustomFieldModal(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Custom Field</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Field Name</label>
              <Input placeholder="e.g., Company Name" value={customFieldName} onChange={(e) => setCustomFieldName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Field Value</label>
              <Input placeholder="e.g., companyName" value={customFieldValue} onChange={(e) => setCustomFieldValue(e.target.value)} />
            </div>
            <p className="text-xs text-gray-500">The field will be available as {`{{${customFieldValue || "fieldValue"}}}`}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomFieldModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveCustomField} disabled={!customFieldName.trim() || !customFieldValue.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SendBulkEmailRoute() {
  return (
    <Suspense>
      <SendBulkEmail />
    </Suspense>
  );
}
