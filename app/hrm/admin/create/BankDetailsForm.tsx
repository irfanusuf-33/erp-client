import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Button } from "@/components/ui/button";

interface BankFormData {
  govIdType1?: string;
  govIdNumber1?: string;
  govIdType2?: string;
  govIdNumber2?: string;
  taxIdNumber?: string;
  nationalIdNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscSwiftCode?: string;
  bankBranch?: string;
}

interface BankDetailsFormProps {
  formData: BankFormData;
  onInputChange: (field: keyof BankFormData, value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function BankDetailsForm({ formData, onInputChange }: BankDetailsFormProps) {
  return (
    <div className="w-full flex flex-col gap-8">
      <h2 className="text-lg font-bold text-slate-900">IDs and Bank Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* Gov ID 1 - Added w-full to SelectTrigger */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Government ID Type 1</label>
          <Select 
            value={formData.govIdType1} 
            onValueChange={(val) => onInputChange("govIdType1", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select ID Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="aadhaar">Aadhaar / National ID</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Government ID Number 1</label>
          <Input
            value={formData.govIdNumber1 ?? ""}
            onChange={(e) => onInputChange("govIdNumber1", e.target.value)}
          />
        </div>

        {/* Gov ID 2 - Added w-full to SelectTrigger */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Government ID Type 2</label>
          <Select 
            value={formData.govIdType2} 
            onValueChange={(val) => onInputChange("govIdType2", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select ID Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pan">PAN Card</SelectItem>
              <SelectItem value="voter">Voter ID</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Government ID Number 2</label>
          <Input
            value={formData.govIdNumber2 ?? ""}
            onChange={(e) => onInputChange("govIdNumber2", e.target.value)}
          />
        </div>

        {/* Remaining rows remain the same... */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Tax Identification Number</label>
          <Input value={formData.taxIdNumber ?? ""} onChange={(e) => onInputChange("taxIdNumber", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">National ID Number</label>
          <Input value={formData.nationalIdNumber ?? ""} onChange={(e) => onInputChange("nationalIdNumber", e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Bank Name</label>
          <Input value={formData.bankName ?? ""} onChange={(e) => onInputChange("bankName", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Account Number</label>
          <Input value={formData.accountNumber ?? ""} onChange={(e) => onInputChange("accountNumber", e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">IFSC/SWIFT Code</label>
          <Input value={formData.ifscSwiftCode ?? ""} onChange={(e) => onInputChange("ifscSwiftCode", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Bank Branch</label>
          <Input value={formData.bankBranch ?? ""} onChange={(e) => onInputChange("bankBranch", e.target.value)} />
        </div>
      </div>

    
    </div>
  );
}