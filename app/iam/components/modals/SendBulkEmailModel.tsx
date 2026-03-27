"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SendBulkEmailModalProps } from "@/types/iam.types";

export default function SendBulkEmailModel({ isOpen, onClose, onSend }: SendBulkEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    onSend(subject, body);
    setSubject(""); setBody("");
  };

  const handleClose = () => { setSubject(""); setBody(""); onClose(); };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Bulk Email</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="Give subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Body</label>
            <textarea
              rows={5}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ring resize-none"
              placeholder="Write an email..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSend} disabled={!subject.trim() || !body.trim()}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
