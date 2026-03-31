import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Button } from "@/components/ui/button";

interface ContactFormData {
  email?: string;
  secondaryEmail?: string;
  phone?: string;
  emergencyContactNumber?: string;
  emergencyContactName?: string;
  relationship?: string;
}

interface ContactDetailsFormProps {
  formData: ContactFormData;
  onInputChange: (field: keyof ContactFormData, value: string) => void;
  errors?: Record<string, string>;
  onNext?: () => void;
  onBack?: () => void;
}

export default function ContactDetailsForm({ 
  formData, 
  onInputChange,
  onNext,
  onBack
}: ContactDetailsFormProps) {
  return (
    // Removed border, background, and shadow to prevent nested cards
    <div className="w-full flex flex-col h-full">
      <h2 className="text-lg font-bold text-slate-900 mb-8">Contact Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 flex-grow">
        
        {/* Row 1 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input
            type="email"
            value={formData.email ?? ""}
            onChange={(e) => onInputChange("email", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Secondary Email Address</label>
          <Input
            type="email"
            value={formData.secondaryEmail ?? ""}
            onChange={(e) => onInputChange("secondaryEmail", e.target.value)}
          />
        </div>

        {/* Row 2 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Phone Number</label>
          <Input
            type="tel"
            value={formData.phone ?? ""}
            onChange={(e) => onInputChange("phone", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Emergency Contact Number</label>
          <Input
            type="tel"
            value={formData.emergencyContactNumber ?? ""}
            onChange={(e) => onInputChange("emergencyContactNumber", e.target.value)}
          />
        </div>

        {/* Row 3 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Emergency Contact Name</label>
          <Input
            type="text"
            value={formData.emergencyContactName ?? ""}
            onChange={(e) => onInputChange("emergencyContactName", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Relationship to Employee</label>
          <Select 
            value={formData.relationship} 
            onValueChange={(value) => onInputChange("relationship", value)}
          >
            <SelectTrigger>
              {/* Added placeholder to initialize the visual state */}
              <SelectValue placeholder="Select relationship..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spouse">Spouse</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="sibling">Sibling</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Single set of bottom Action Buttons */}
      
    </div>
  );
}