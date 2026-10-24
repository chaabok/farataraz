import { Table } from "@tanstack/react-table";
import { logUserActivity } from "@/lib/activity-logger";

interface UseGridExportProps<TData> {
  table: Table<TData>;
  columnsDef: any[];
  title?: string;
  onExcelExport?: () => void;
  onPdfExport?: () => void;
  onWordExport?: () => void;
}

export function useGridExport<TData>({
  table,
  columnsDef,
  title,
  onExcelExport,
  onPdfExport,
  onWordExport,
}: UseGridExportProps<TData>) {

  const handleExcelExport = () => {
    logUserActivity('EXPORT_EXCEL', title || 'Unknown Grid', 'User exported items to Excel');
    if (onExcelExport) {
      onExcelExport();
      return;
    }

    const visibleColumns = table.getVisibleLeafColumns().filter(col => col.id !== 'select');
    const headers = visibleColumns.map((col) => {
      const def = columnsDef.find(c => c.key === (col.columnDef as any).accessorKey || c.key === col.id);
      return typeof def?.header === "string" ? def.header : col.id;
    });

    const rows = table.getCoreRowModel().rows.map((row) => {
      return visibleColumns.map((col) => {
        const val = row.getValue(col.id);
        return `"${String(val ?? "").replace(/"/g, '""')}"`;
      });
    });

    const csvContent = [
      headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${title ? title.replace(/\s+/g, "_") : "export"}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePdfExport = () => {
    logUserActivity('EXPORT_PDF', title || 'Unknown Grid', 'User exported items to PDF/Print');
    if (onPdfExport) {
      onPdfExport();
      return;
    }
    window.print();
  };

  const handleWordExport = () => {
    logUserActivity('EXPORT_WORD', title || 'Unknown Grid', 'User exported items to Word');
    if (onWordExport) {
      onWordExport();
      return;
    }

    const visibleColumns = table.getVisibleLeafColumns().filter(col => col.id !== 'select');
    const headers = visibleColumns.map((col) => {
      const def = columnsDef.find(c => c.key === (col.columnDef as any).accessorKey || c.key === col.id);
      return typeof def?.header === "string" ? def.header : col.id;
    });

    const rows = table.getCoreRowModel().rows.map((row) => {
      return visibleColumns.map((col) => {
        const val = row.getValue(col.id);
        return String(val ?? "");
      });
    });

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"></head><body>
      <table border="1">
        <thead>
          <tr>${headers.map(h => "<th>" + String(h).replace(/</g, "&lt;") + "</th>").join("")}</tr>
        </thead>
        <tbody>
          ${rows.map(r => "<tr>" + r.map(cell => "<td>" + String(cell).replace(/</g, "&lt;") + "</td>").join("") + "</tr>").join("")}
        </tbody>
      </table>
      </body></html>
    `;

    const blob = new Blob(["\uFEFF" + htmlContent], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${title ? title.replace(/\\s+/g, "_") : "export"}_${
        new Date().toISOString().split("T")[0]
      }.doc`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { handleExcelExport, handlePdfExport, handleWordExport };
}
