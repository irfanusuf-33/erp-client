"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useGlobalStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputField from "@/components/ui/form/InputField";
import TextArea from "@/components/ui/form/TextArea";
import Select from "@/components/ui/form/Select";
import Form from "@/components/ui/form/Form";
import { showSuccess, showError } from "@/lib/toast";

export default function CreateWarehouse() {
  const router = useRouter();
  const { addWarehouse, searchUsersForInventory } = useGlobalStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    description: "",
    country: "",
    buildingNo: "",
    streetNumber: "",
    streetName: "",
    unitNumber: "",
    city: "",
    state: "",
    zipCode: "",
    operators: [{ name: "", email: "" }],
    enabled: false,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [operatorErrors, setOperatorErrors] = useState<Record<number, Record<string, string>>>({});
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);
  const [searchResults, setSearchResults] = useState<any[][]>([[]]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([false]);
  const [debounceTimeouts, setDebounceTimeouts] = useState<(NodeJS.Timeout | null)[]>([null]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleOperatorChange = (index: number, field: string, value: string) => {
    const updatedOperators = [...formData.operators];
    updatedOperators[index] = { ...updatedOperators[index], [field]: value };
    setFormData((prev) => ({ ...prev, operators: updatedOperators }));

    if (operatorErrors[index]?.[field]) {
      setOperatorErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          delete newErrors[index][field];
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        return newErrors;
      });
    }
  };

  const handleSearchChange = async (index: number, value: string) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = value;
    setSearchTerms(newSearchTerms);

    if (debounceTimeouts[index]) clearTimeout(debounceTimeouts[index]!);

    if (value.trim() === "") {
      const newResults = [...searchResults];
      newResults[index] = [];
      setSearchResults(newResults);
      return;
    }

    const timeout = setTimeout(async () => {
      const newLoading = [...searchLoading];
      newLoading[index] = true;
      setSearchLoading(newLoading);

      try {
        const res = await searchUsersForInventory(value);
        if (res.success) {
          const newResults = [...searchResults];
          newResults[index] = res.users || [];
          setSearchResults(newResults);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        const newLoading = [...searchLoading];
        newLoading[index] = false;
        setSearchLoading(newLoading);
      }
    }, 500);

    const newTimeouts = [...debounceTimeouts];
    newTimeouts[index] = timeout;
    setDebounceTimeouts(newTimeouts);
  };

  const handleSelectUser = (index: number, user: any) => {
    const fullName = `${user.fName || ""} ${user.lName || ""}`.trim() || "Unknown User";
    const updatedOperators = [...formData.operators];
    updatedOperators[index] = { name: fullName, email: user.email };
    setFormData((prev) => ({ ...prev, operators: updatedOperators }));

    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = "";
    setSearchTerms(newSearchTerms);

    const newResults = [...searchResults];
    newResults[index] = [];
    setSearchResults(newResults);
  };

  const addOperator = () => {
    setFormData((prev) => ({
      ...prev,
      operators: [...prev.operators, { name: "", email: "" }],
    }));
    setSearchTerms((prev) => [...prev, ""]);
    setSearchResults((prev) => [...prev, []]);
    setSearchLoading((prev) => [...prev, false]);
    setDebounceTimeouts((prev) => [...prev, null]);
  };

  const removeOperator = (index: number) => {
    if (formData.operators.length > 1) {
      setFormData((prev) => ({
        ...prev,
        operators: prev.operators.filter((_, i) => i !== index),
      }));
      setSearchTerms((prev) => prev.filter((_, i) => i !== index));
      setSearchResults((prev) => prev.filter((_, i) => i !== index));
      setSearchLoading((prev) => prev.filter((_, i) => i !== index));
      setDebounceTimeouts((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    setValidationErrors({});
    setOperatorErrors({});

    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Warehouse name is required";
    if (!formData.capacity) errors.capacity = "Capacity is required";
    if (!formData.description) errors.description = "Description is required";
    if (!formData.country) errors.country = "Country is required";
    if (!formData.buildingNo) errors.buildingNo = "Building number is required";
    if (!formData.streetNumber) errors.streetNumber = "Street number is required";
    if (!formData.streetName) errors.streetName = "Street name is required";
    if (!formData.unitNumber) errors.unitNumber = "Unit number is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.zipCode) errors.zipCode = "Zip code is required";

    const opErrors: Record<number, Record<string, string>> = {};
    formData.operators.forEach((op, index) => {
      if (!op.name) {
        if (!opErrors[index]) opErrors[index] = {};
        opErrors[index].name = "Operator name is required";
      }
      if (!op.email) {
        if (!opErrors[index]) opErrors[index] = {};
        opErrors[index].email = "Operator email is required";
      }
    });

    if (Object.keys(errors).length > 0 || Object.keys(opErrors).length > 0) {
      setValidationErrors(errors);
      setOperatorErrors(opErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await addWarehouse(formData);
      if (response.success) {
        showSuccess("Warehouse Created", "The warehouse has been created successfully.");
        router.push("/inventory/warehouse/list");
      } else {
        showError("Failed to Create Warehouse", response.msg || "An error occurred.");
        setValidationErrors({ submit: response.msg || "Failed to create warehouse" });
      }
    } catch (error: any) {
      setValidationErrors({ submit: error?.message || "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-12 py-7 bg-gray-100 dark:bg-zinc-900 min-h-full">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Create Warehouse</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
        <Form title="Warehouse Details" desc="*Required field">
          <InputField
            label="Warehouse Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter your warehouse name"
            required
            error={validationErrors.name}
          />
          <InputField
            label="Warehouse Capacity"
            value={formData.capacity}
            onChange={(e) => handleInputChange("capacity", e.target.value)}
            placeholder="Enter your warehouse capacity"
            required
            error={validationErrors.capacity}
          />
          <div className="col-span-2">
            <TextArea
              label="Warehouse Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description of the Warehouse"
              rows={5}
              required
              error={validationErrors.description}
            />
          </div>
        </Form>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
        <Form title="Address Details" cols={2}>
          <Select
            label="Country"
            options={[
              { value: "usa", label: "United States" },
              { value: "canada", label: "Canada" },
              { value: "uk", label: "United Kingdom" },
              { value: "germany", label: "Germany" },
              { value: "france", label: "France" },
              { value: "australia", label: "Australia" },
            ]}
            placeholder="Select Country"
            defaultValue={formData.country}
            onChange={(value) => handleInputChange("country", value)}
            required
            error={validationErrors.country}
          />
          <InputField
            label="Building No."
            value={formData.buildingNo}
            onChange={(e) => handleInputChange("buildingNo", e.target.value)}
            placeholder="Enter building no."
            required
            error={validationErrors.buildingNo}
          />
          <InputField
            label="Street Number"
            value={formData.streetNumber}
            onChange={(e) => handleInputChange("streetNumber", e.target.value)}
            placeholder="001"
            required
            error={validationErrors.streetNumber}
          />
          <InputField
            label="Street Name"
            value={formData.streetName}
            onChange={(e) => handleInputChange("streetName", e.target.value)}
            placeholder="Enter Street name"
            required
            error={validationErrors.streetName}
          />
          <InputField
            label="Unit Number"
            value={formData.unitNumber}
            onChange={(e) => handleInputChange("unitNumber", e.target.value)}
            placeholder="Enter Unit Number"
            required
            error={validationErrors.unitNumber}
          />
          <InputField
            label="City"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="Enter your city"
            required
            error={validationErrors.city}
          />
          <Select
            label="State"
            options={[
              { value: "california", label: "California" },
              { value: "texas", label: "Texas" },
              { value: "florida", label: "Florida" },
              { value: "newyork", label: "New York" },
              { value: "illinois", label: "Illinois" },
              { value: "pennsylvania", label: "Pennsylvania" },
            ]}
            placeholder="Select State"
            defaultValue={formData.state}
            onChange={(value) => handleInputChange("state", value)}
            required
            error={validationErrors.state}
          />
          <InputField
            label="Zip/Postal Code"
            value={formData.zipCode}
            onChange={(e) => handleInputChange("zipCode", e.target.value)}
            placeholder="Enter zip code"
            required
            error={validationErrors.zipCode}
          />
        </Form>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
        <Form title="Operator Details" cols={2}>
          {formData.operators.map((operator, i) => (
            <div key={i} className="col-span-2 grid grid-cols-2 gap-4">
              <div className="form-group">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Operator {i + 1} - Name<span className="text-red-500 ml-1">*</span>
                  </label>
                  {formData.operators.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOperator(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    placeholder="Search Operator"
                    value={operator.name || searchTerms[i] || ""}
                    onChange={(e) => handleSearchChange(i, e.target.value)}
                  />
                  {searchLoading[i] && (
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400">Searching...</span>
                  )}
                  {searchResults[i]?.length > 0 && (
                    <div className="absolute z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded shadow-lg w-full max-h-48 overflow-y-auto mt-1">
                      {searchResults[i].map((user: any, userIdx: number) => {
                        const fullName = `${user.fName || ""} ${user.lName || ""}`.trim() || "Unknown User";
                        return (
                          <div
                            key={userIdx}
                            className="p-3 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
                            onClick={() => handleSelectUser(i, user)}
                          >
                            <div className="font-medium text-sm">{fullName}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {operatorErrors[i]?.name && (
                  <p className="mt-1 text-xs text-red-500">{operatorErrors[i].name}</p>
                )}
              </div>
              <InputField
                label="Email"
                value={operator.email}
                onChange={(e) => handleOperatorChange(i, "email", e.target.value)}
                placeholder="Enter your email"
                required
                error={operatorErrors[i]?.email}
              />
            </div>
          ))}
          <div className="col-span-2">
            <button
              type="button"
              onClick={addOperator}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus size={16} />
              <span>Add Operator</span>
            </button>
          </div>
        </Form>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 mb-6">
        <Form title="Warehouse Settings">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => handleInputChange("enabled", e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Enable Warehouse</span>
            </label>
          </div>
        </Form>
      </div>

      {validationErrors.submit && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.submit}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/inventory/warehouse/list")}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

