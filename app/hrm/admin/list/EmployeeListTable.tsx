"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/store";
import type { EmployeeListItem } from "@/types/hrm.types";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const SEARCH_DEBOUNCE_MS = 300;
const TABLE_COLUMNS = [
  "Employee ID",
  "First Name",
  "Last Name",
  "Department",
  "Line Manager",
] as const;

function TableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={`skeleton-${rowIndex}`} className="border-b border-slate-100">
          {TABLE_COLUMNS.map((column) => (
            <td key={`${column}-${rowIndex}`} className="px-5 py-3">
              <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const getCellValue = (value: string) => value.trim() || "-";

export default function EmployeeListTable() {
  const fetchEmployees = useGlobalStore((state) => state.fetchEmployees);
  const employees = useGlobalStore((state) => state.employees);
  const employeesTotal = useGlobalStore((state) => state.employeesTotal);
  const isLoading = useGlobalStore((state) => state.hrmLoading);
  const errorMessage = useGlobalStore((state) => state.errorMessage);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(PAGE_SIZE_OPTIONS[0]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPageIndex(0);
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    void fetchEmployees({
      page: pageIndex + 1,
      limit: pageSize,
      search: searchTerm,
    });
  }, [fetchEmployees, pageIndex, pageSize, searchTerm]);

  const totalPages = useMemo(() => {
    if (employeesTotal <= 0) {
      return 1;
    }
    return Math.ceil(employeesTotal / pageSize);
  }, [employeesTotal, pageSize]);

  const canGoPrevious = pageIndex > 0;
  const canGoNext = pageIndex + 1 < totalPages;
  const startItem = employeesTotal === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem =
    employeesTotal === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, employeesTotal);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Employees Directory</h2>

        <div className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:w-80">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by employee id or name"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-auto border-0 bg-transparent p-0 text-sm text-slate-700 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {TABLE_COLUMNS.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium text-slate-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading && <TableSkeletonRows />}

            {!isLoading &&
              employees.map((employee: EmployeeListItem, index) => {
                const employeeId = getCellValue(
                  employee.organizationalDetails.employeeId,
                );

                return (
                  <tr
                    key={`${employee._id || employeeId}-${index}`}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-5 py-3">
                      {employeeId === "-" ? (
                        <span className="text-slate-500">-</span>
                      ) : (
                        <Link
                          href={`/hrm/admin/employee/${encodeURIComponent(employeeId)}`}
                          className={cn(
                            "font-medium text-blue-600 transition-colors",
                            "hover:text-blue-700 hover:underline",
                          )}
                        >
                          {employeeId}
                        </Link>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                      {getCellValue(employee.personalDetails.firstName)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                      {getCellValue(employee.personalDetails.lastName)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                      {getCellValue(employee.organizationalDetails.departmentName)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                      {getCellValue(employee.organizationalDetails.lineManager)}
                    </td>
                  </tr>
                );
              })}

            {!isLoading && employees.length === 0 && (
              <tr>
                <td
                  colSpan={TABLE_COLUMNS.length}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  {errorMessage || "No employees found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          Showing {startItem}-{endItem} of {employeesTotal}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="employee-page-size" className="text-xs text-slate-500">
              Rows
            </label>
            <select
              id="employee-page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number]);
                setPageIndex(0);
              }}
              className="h-8 rounded-md border border-slate-200 px-2 text-xs text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
              disabled={!canGoPrevious || isLoading}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="px-2 text-xs font-medium text-slate-600">
              {pageIndex + 1} / {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPageIndex((current) => Math.min(totalPages - 1, current + 1))
              }
              disabled={!canGoNext || isLoading}
              className="h-8 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
