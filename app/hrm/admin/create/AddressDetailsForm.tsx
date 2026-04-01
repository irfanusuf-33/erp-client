import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface AddressFormData {
  country?: string;
  city?: string;
  state?: string;
  streetNumber?: string;
  addressLine2?: string;
  buildingNo?: string;
  zipCode?: string;
}

interface AddressDetailsFormProps {
  formData: AddressFormData;
  onInputChange: (field: keyof AddressFormData, value: string) => void;
  errors?: Record<string, string>;
}

export default function AddressDetailsForm({
  formData,
  onInputChange,
}: AddressDetailsFormProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 w-full">
      {/* Title */}
      <h2 className="text-sm font-semibold text-slate-700 mb-8">
        Address Details
      </h2>

      {/* FORM GRID */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-6">

        {/* Country */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">Country</label>
          <Select
            value={formData.country}
            onValueChange={(value) => onInputChange("country", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="in">India</SelectItem>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Building */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">Building No.</label>
          <Input
            value={formData.buildingNo ?? ""}
            onChange={(e) =>
              onInputChange("buildingNo", e.target.value)
            }
          />
        </div>

        {/* Street */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">
            Street Number / Name
          </label>
          <Input
            value={formData.streetNumber ?? ""}
            onChange={(e) =>
              onInputChange("streetNumber", e.target.value)
            }
          />
        </div>

        {/* City */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">City</label>
          <Input
            value={formData.city ?? ""}
            onChange={(e) => onInputChange("city", e.target.value)}
          />
        </div>

        {/* Address Line 2 */}
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Enter Unit Details"
            value={formData.addressLine2 ?? ""}
            onChange={(e) =>
              onInputChange("addressLine2", e.target.value)
            }
          />
        </div>

        <div></div>

        {/* State */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">State</label>
          <Select
            value={formData.state}
            onValueChange={(value) => onInputChange("state", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="mh">Maharashtra</SelectItem>
              <SelectItem value="dl">Delhi</SelectItem>
              <SelectItem value="ka">Karnataka</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Zip */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600">
            Zip/Postal Code
          </label>
          <Input
            value={formData.zipCode ?? ""}
            onChange={(e) =>
              onInputChange("zipCode", e.target.value)
            }
          />
        </div>
      </div>

      {/* Checkbox */}
      <div className="flex items-center gap-3 mt-8">
        <input type="checkbox" className="h-4 w-4" />
        <span className="text-sm text-slate-600">
          Postal address same as current address
        </span>
      </div>

      {/* Add postal button */}
      <div className="mt-4">
        <Button variant="outline" size="sm">
          + Add Postal Address
        </Button>
      </div>
    </div>
  );
}