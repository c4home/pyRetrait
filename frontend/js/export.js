/**
 * pyRetrait — Downloadable Reports, CSV Export, PDF Printing, and JSON Backup Engine
 */

window.ReportExporter = (function() {
  'use strict';

  // Export full year-by-year cashflow schedule to CSV
  function exportScheduleToCSV(plan, projection) {
    const currency = plan.currency || 'VND';
    const headers = [
      "Tuoi (Age)",
      "Trang Thai (Status)",
      `Thu Nhap (${currency})`,
      `Chi Tieu (${currency})`,
      `Rut hoac Nap (${currency})`,
      `Thue Du Kien (${currency})`,
      `Tai San Cuoi Nam (${currency})`,
      `Suc Mua Thuc (${currency})`
    ];

    const rows = projection.timeline.map(row => [
      row.age,
      row.isRetired ? "Nghi Huu (FIRE)" : "Tich Luy (Working)",
      Math.round(row.income),
      Math.round(row.expenses),
      Math.round(row.netCashFlow),
      Math.round(row.tax),
      Math.round(row.portfolioEnd),
      Math.round(row.realPortfolioEnd)
    ]);

    let csvContent = "\uFEFF" + headers.join(",") + "\n";
    rows.forEach(r => {
      csvContent += r.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `pyRetrait_CashFlow_${plan.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Trigger browser print to PDF
  function printExecutiveSummary() {
    window.print();
  }

  // Export all plans to JSON backup file
  function exportPlansToJSON(plansData) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plansData, null, 2));
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `pyRetrait_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return {
    exportScheduleToCSV,
    printExecutiveSummary,
    exportPlansToJSON
  };
})();
