"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Paperclip, Info } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SendBulkEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [templates, setTemplates] = useState<any[]>([]);
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

  const loadTemplate = (tmpl: any) => {
    setSubject(tmpl.subject); setBody(tmpl.content); setHeader(tmpl.header || ""); setFooter(tmpl.footer || "");
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

  const previewHtml = [showHeaderFooter && header, body, showHeaderFooter && footer].filter(Boolean).join("<br/>");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Send Bulk Email</h1>
      <div className="flex gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Template Name</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm focus:outline-none focus:border-ring"
              onChange={(e) => { const t = templates.find((x) => x.id === e.target.value); if (t) loadTemplate(t); }}
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
              <Button
                type="button"
                variant="outline"
                className="w-fit flex items-center gap-1"
                onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = ".pdf"; i.multiple = true; i.onchange = (e: any) => setPdfFiles((p) => [...p, ...Array.from<File>(e.target.files || [])]); i.click(); }}
              >
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
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Headers</label>
              <textarea className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ring resize-none" rows={3} placeholder="Email header..." value={header} onChange={(e) => setHeader(e.target.value)} />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Body</label>
            <textarea className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ring resize-none" rows={8} placeholder="Write your email content here..." value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          {showHeaderFooter && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Footer</label>
              <textarea className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ring resize-none" rows={3} placeholder="Email footer..." value={footer} onChange={(e) => setFooter(e.target.value)} />
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowTemplateModal(true)}>Save as template</Button>
            <Button variant="outline" onClick={() => setShowPreviewModal(true)} disabled={!subject.trim() || !body.trim()}>Preview</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSend} disabled={!subject.trim() || !body.trim() || isLoading}>{isLoading ? "Sending..." : "Send"}</Button>
          </div>
        </div>

        <div className="w-64 flex flex-col gap-3">
          <h2 className="font-semibold">Template Fields</h2>
          <Input placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="flex gap-2 text-xs text-gray-500 mt-2">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <p>Drag and drop fields into your template editor to include dynamic content.</p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={(open) => { if (!open) setShowPreviewModal(false); }}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            <div className="mb-2 text-sm"><span className="font-medium">Subject:</span> {subject || "-"}</div>
            <div className="border rounded p-4 bg-gray-50" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={(open) => { if (!open) setShowTemplateModal(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Name Your Template</DialogTitle>
          </DialogHeader>
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
    </div>
  );
}
