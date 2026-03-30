"use client";
import React, { useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    MRT_ToggleGlobalFilterButton,
    MRT_ToggleFiltersButton,
    MRT_ShowHideColumnsButton,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFullScreenButton,
} from 'material-react-table';
import { Box, Button, MenuItem, ListItemIcon, Menu, IconButton } from '@mui/material';
import { Download, MoreVertical } from 'lucide-react';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type RowAction<T> = {
  label: string | ((rows: T[]) => string);
  icon?: React.ReactNode;
  onClick: (rows: T[]) => void;
  alwaysEnabled?: boolean;
};

export type BaseTableProps<T extends Record<string, any>> = {
  data: T[];
  columns: MRT_ColumnDef<T, any>[];
  enableRowActions?: boolean;
  enableRowExpansion?: boolean;
  enableRowSelection?: boolean | ((row: MRT_Row<T>) => boolean);
  rowDetailFields?: (keyof T)[];
  onExportRows?: (rows: T[]) => void;
  rowActions?: RowAction<T>[];
  toolbarActions?: RowAction<T>[];
  toolbarQuickActions?: RowAction<T>[];
  isLoading?: boolean;
  manualPagination?: boolean;
  manualFiltering?: boolean;
  rowCount?: number;
  state?: any;
  onPaginationChange?: any;
  onGlobalFilterChange?: any;
  getRowId?: (row: T) => string;
  renderEmptyRowsFallback?: () => React.ReactNode;
};

const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
});

function BaseTable<T extends Record<string, any>>({
  data,
  columns,
  enableRowActions = false,
  enableRowExpansion = false,
  enableRowSelection = false,
  rowDetailFields,
  onExportRows,
  rowActions,
  toolbarActions,
  toolbarQuickActions,
  isLoading = false,
  manualPagination = false,
  manualFiltering = false,
  rowCount,
  state,
  onPaginationChange,
  onGlobalFilterChange,
  getRowId,
  renderEmptyRowsFallback,
}: BaseTableProps<T>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const openMenu = Boolean(anchorEl);
  const [toolbarMenuAnchor, setToolbarMenuAnchor] = useState<HTMLElement | null>(null);
  const openToolbarMenu = Boolean(toolbarMenuAnchor);

  const handleExportRowsWithPDFFormat = (rows: MRT_Row<any>[]) => {
    const doc = new jsPDF();
    const tableData: (string | number)[][] = rows.map((row) =>
      columns.map((col) => {
        if ('accessorFn' in col && col.accessorFn) return String(col.accessorFn(row.original,));
        if ('accessorKey' in col && col.accessorKey) {
          const value = row.original[col.accessorKey as string];
          return typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
        }
        return '';
      })
    );
    const tableHeaders: string[] = columns.map((c) => String(c.header));
    ({ doc: doc as any, head: [tableHeaders], body: tableData });
    doc.save('export.pdf');
  };

  const handleExportRows = (rows: MRT_Row<any>[]) => {
    const rowData = rows.map((row) => {
      const cleanRow: any = {};
      Object.keys(row.original).forEach((key) => {
        const value = row.original[key];
        cleanRow[key] = value === null || value === undefined ? value : typeof value === 'object' ? JSON.stringify(value) : value;
      });
      return cleanRow;
    });
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportDataWithCSVFormat = () => {
    const cleanData = data.map((row) => {
      const cleanRow: any = {};
      Object.keys(row).forEach((key) => {
        const value = row[key];
        cleanRow[key] = value === null || value === undefined ? value : typeof value === 'object' ? JSON.stringify(value) : value;
      });
      return cleanRow;
    });
    const csv = generateCsv(csvConfig)(cleanData);
    download(csvConfig)(csv);
  };

  const hasRowActions = enableRowActions && !!rowActions?.length;

  const table = useMaterialReactTable({
    data,
    columns,
    enableRowSelection: typeof enableRowSelection === 'function' ? enableRowSelection : !!enableRowSelection,
    enableRowActions: hasRowActions,
    enableExpanding: enableRowExpansion,
    positionActionsColumn: 'last',
    layoutMode: 'grid',
    manualPagination,
    manualFiltering,
    rowCount,
    onPaginationChange,
    onGlobalFilterChange,
    getRowId,
    renderEmptyRowsFallback,
    state: { isLoading, showProgressBars: isLoading, ...state },

    renderRowActionMenuItems: hasRowActions
      ? ({ row, closeMenu }) =>
          rowActions!.map((action, index) => (
            <MenuItem key={index} onClick={() => { action.onClick([row.original]); closeMenu(); }}>
              {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
              {action.label as string}
            </MenuItem>
          ))
      : undefined,

    renderDetailPanel:
      enableRowExpansion && rowDetailFields
        ? ({ row }) => (
            <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-around', left: '30px', maxWidth: '1000px', position: 'sticky', minWidth: '800px' }}>
              {rowDetailFields.map((field) => (
                <Box key={String(field)}>
                  <div><strong>{String(field)}:</strong></div>
                  <div>{renderFieldValue(row.original[field])}</div>
                </Box>
              ))}
            </Box>
          )
        : undefined,

    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',

    renderTopToolbarCustomActions: onExportRows
      ? ({ table }) => (
          <Box sx={{ display: 'flex', gap: '16px', padding: '8px' }}>
            <Button onClick={(e) => setAnchorEl(e.currentTarget)} startIcon={<Download size={16} />}>
              Export
            </Button>
            <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled={table.getPrePaginationRowModel().rows.length === 0} onClick={() => { handleExportDataWithCSVFormat(); setAnchorEl(null); }}>
                <ListItemIcon><Download size={16} /></ListItemIcon>Export All Rows as CSV
              </MenuItem>
              <MenuItem disabled={table.getPrePaginationRowModel().rows.length === 0} onClick={() => { handleExportRowsWithPDFFormat(table.getRowModel().rows); setAnchorEl(null); }}>
                <ListItemIcon><Download size={16} /></ListItemIcon>Export All Rows as PDF
              </MenuItem>
              <MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => { handleExportRows(table.getSelectedRowModel().rows); setAnchorEl(null); }}>
                <ListItemIcon><Download size={16} /></ListItemIcon>Export Selected Rows
              </MenuItem>
            </Menu>
          </Box>
        )
      : undefined,

    renderToolbarInternalActions:
      (toolbarActions && toolbarActions.length > 0) || (toolbarQuickActions && toolbarQuickActions.length > 0)
        ? ({ table }) => (
            <Box sx={{ display: 'flex', gap: '0px', alignItems: 'center' }}>
              <MRT_ToggleGlobalFilterButton table={table} />
              <MRT_ToggleFiltersButton table={table} />
              <MRT_ShowHideColumnsButton table={table} />
              <MRT_ToggleDensePaddingButton table={table} />
              <MRT_ToggleFullScreenButton table={table} />
              {toolbarQuickActions?.map((action, index) => {
                const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original) as T[];
                const label = typeof action.label === 'function' ? action.label(selectedRows) : action.label;
                return (
                  <IconButton key={`quick-${index}`} size="small" aria-label={label} title={label} onClick={() => action.onClick(selectedRows)} disabled={action.alwaysEnabled ? false : !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}>
                    {action.icon}
                  </IconButton>
                );
              })}
              {toolbarActions && toolbarActions.length > 0 && (
                <>
                  <IconButton onClick={(e) => setToolbarMenuAnchor(e.currentTarget)} size="small">
                    <MoreVertical size={20} />
                  </IconButton>
                  <Menu anchorEl={toolbarMenuAnchor} open={openToolbarMenu} onClose={() => setToolbarMenuAnchor(null)}>
                    {toolbarActions.map((action, index) => {
                      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original) as T[];
                      const label = typeof action.label === 'function' ? action.label(selectedRows) : action.label;
                      return (
                        <MenuItem key={index} onClick={() => { action.onClick(selectedRows); setToolbarMenuAnchor(null); }} disabled={action.alwaysEnabled ? false : !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}>
                          {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
                          {label}
                        </MenuItem>
                      );
                    })}
                  </Menu>
                </>
              )}
            </Box>
          )
        : undefined,
  });

  return <MaterialReactTable table={table} />;
}

export default BaseTable;

const renderFieldValue = (value: any) => {
  if (Array.isArray(value)) {
    return value.map((item, idx) => (
      <div key={idx}>{typeof item === 'object' ? Object.entries(item).map(([k, v]) => <div key={k}><strong>{k}:</strong> {String(v)}</div>) : String(item)}</div>
    ));
  } else if (typeof value === 'object' && value !== null) {
    return Object.entries(value).map(([k, v]) => <div key={k}><strong>{k}:</strong> {String(v)}</div>);
  }
  return <div>{String(value)}</div>;
};
