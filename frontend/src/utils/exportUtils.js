import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToCSV(data, filename = "kpi-report") {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      if (typeof val === "string" && val.includes(",")) return `"${val}"`;
      return val;
    }).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(title, columns, rows, filename = "kpi-report") {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Rasoi Master — Generated ${new Date().toLocaleString()}`, 14, 28);

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 35,
    theme: "striped",
    headStyles: { fillColor: [99, 102, 241], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`${filename}.pdf`);
}

export function generateDomainExportData(aggregated, domain) {
  const domainData = aggregated[domain];
  if (!domainData) return { columns: [], rows: [] };

  const entries = Object.entries(domainData).filter(([k, v]) => typeof v !== "object");
  return {
    columns: ["KPI", "Value"],
    rows: entries.map(([key, value]) => [
      key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()),
      typeof value === "number" ? value.toLocaleString() : String(value),
    ]),
  };
}
