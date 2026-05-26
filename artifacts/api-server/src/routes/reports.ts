import { Router } from "express";
import { db, expensesTable } from "@workspace/db";
import { like } from "drizzle-orm";
import { DownloadReportQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/reports/download", async (req, res) => {
  const query = DownloadReportQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  const month = query.data.month;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const filterMonth = month || currentMonth;

  const expenses = await db
    .select()
    .from(expensesTable)
    .where(like(expensesTable.date, `${filterMonth}%`));

  const categoryMap: Record<string, number> = {};
  for (const e of expenses) {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + parseFloat(e.amount);
  }

  const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  let csv = "Date,Category,Description,Amount\n";
  for (const e of expenses) {
    const desc = e.description.replace(/"/g, '""');
    csv += `${e.date},${e.category},"${desc}",${parseFloat(e.amount).toFixed(2)}\n`;
  }

  csv += "\n";
  csv += "Category Summary\n";
  csv += "Category,Total Amount,Percentage\n";
  for (const [category, total] of Object.entries(categoryMap).sort(
    (a, b) => b[1] - a[1]
  )) {
    const pct = totalAmount > 0 ? ((total / totalAmount) * 100).toFixed(1) : "0.0";
    csv += `${category},${total.toFixed(2)},${pct}%\n`;
  }

  csv += `\nTotal,${totalAmount.toFixed(2)},100%\n`;
  csv += `\nReport Period: ${filterMonth}\n`;
  csv += `Generated: ${new Date().toISOString()}\n`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="expense-report-${filterMonth}.csv"`
  );
  res.send(csv);
});

export default router;
