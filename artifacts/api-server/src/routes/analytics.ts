import { Router } from "express";
import { db, expensesTable } from "@workspace/db";
import { like, sql } from "drizzle-orm";
import { SimpleLinearRegression } from "ml-regression";
import { GetByCategoryQueryParams } from "@workspace/api-zod";

const router = Router();

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function getLastMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
}

router.get("/analytics/summary", async (req, res) => {
  const currentMonth = getCurrentMonth();
  const lastMonth = getLastMonth();

  const allExpenses = await db.select().from(expensesTable);

  const thisMonthExpenses = allExpenses.filter((e) =>
    e.date.startsWith(currentMonth)
  );
  const lastMonthExpenses = allExpenses.filter((e) =>
    e.date.startsWith(lastMonth)
  );

  const totalThisMonth = thisMonthExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  );
  const totalLastMonth = lastMonthExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  );

  const daysInMonth = new Date().getDate();
  const avgDaily = daysInMonth > 0 ? totalThisMonth / daysInMonth : 0;

  const categoryTotals: Record<string, number> = {};
  for (const e of thisMonthExpenses) {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount);
  }
  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const changePercent =
    totalLastMonth > 0
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
      : null;

  res.json({
    totalThisMonth,
    totalLastMonth,
    avgDaily,
    topCategory,
    expenseCount: thisMonthExpenses.length,
    changePercent,
  });
});

router.get("/analytics/by-category", async (req, res) => {
  const query = GetByCategoryQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  const month = query.data.month || getCurrentMonth();
  const expenses = await db
    .select()
    .from(expensesTable)
    .where(like(expensesTable.date, `${month}%`));

  const categoryMap: Record<string, { total: number; count: number }> = {};
  for (const e of expenses) {
    const amt = parseFloat(e.amount);
    if (!categoryMap[e.category]) {
      categoryMap[e.category] = { total: 0, count: 0 };
    }
    categoryMap[e.category].total += amt;
    categoryMap[e.category].count += 1;
  }

  const grandTotal = Object.values(categoryMap).reduce(
    (sum, c) => sum + c.total,
    0
  );

  const result = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count,
    percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
  }));

  result.sort((a, b) => b.total - a.total);
  res.json(result);
});

router.get("/analytics/trend", async (req, res) => {
  const expenses = await db.select().from(expensesTable);

  const monthMap: Record<string, number> = {};
  for (const e of expenses) {
    const month = e.date.slice(0, 7);
    monthMap[month] = (monthMap[month] || 0) + parseFloat(e.amount);
  }

  const trend = Object.entries(monthMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, total]) => ({ month, total }));

  res.json(trend);
});

router.get("/analytics/predict", async (req, res) => {
  const expenses = await db.select().from(expensesTable);

  const monthMap: Record<string, number> = {};
  for (const e of expenses) {
    const month = e.date.slice(0, 7);
    monthMap[month] = (monthMap[month] || 0) + parseFloat(e.amount);
  }

  const sortedMonths = Object.keys(monthMap).sort();
  const basedOnMonths = sortedMonths.length;

  let predictedTotal: number;
  let confidence: number;

  if (sortedMonths.length >= 2) {
    const x = sortedMonths.map((_, i) => i);
    const y = sortedMonths.map((m) => monthMap[m]);
    const regression = new SimpleLinearRegression(x, y);
    predictedTotal = Math.max(0, regression.predict(sortedMonths.length));
    const r2 = regression.score(x, y);
    confidence = Math.min(0.95, Math.max(0.1, r2));
  } else if (sortedMonths.length === 1) {
    predictedTotal = monthMap[sortedMonths[0]];
    confidence = 0.3;
  } else {
    predictedTotal = 0;
    confidence = 0;
  }

  const categoryMonthMap: Record<string, Record<string, number>> = {};
  for (const e of expenses) {
    const month = e.date.slice(0, 7);
    if (!categoryMonthMap[e.category]) {
      categoryMonthMap[e.category] = {};
    }
    categoryMonthMap[e.category][month] =
      (categoryMonthMap[e.category][month] || 0) + parseFloat(e.amount);
  }

  const breakdown = Object.entries(categoryMonthMap).map(([category, months]) => {
    const catSortedMonths = Object.keys(months).sort();
    let predicted: number;

    if (catSortedMonths.length >= 2) {
      const x = catSortedMonths.map((_, i) => i);
      const y = catSortedMonths.map((m) => months[m]);
      const regression = new SimpleLinearRegression(x, y);
      predicted = Math.max(0, regression.predict(catSortedMonths.length));
    } else {
      predicted = Object.values(months).reduce((a, b) => a + b, 0) / catSortedMonths.length;
    }

    return { category, predicted };
  });

  breakdown.sort((a, b) => b.predicted - a.predicted);

  res.json({
    predictedTotal,
    confidence,
    breakdown,
    basedOnMonths,
  });
});

router.get("/analytics/recommendations", async (req, res) => {
  const expenses = await db.select().from(expensesTable);

  const currentMonth = getCurrentMonth();
  const lastMonth = getLastMonth();

  const currentMonthExpenses = expenses.filter((e) =>
    e.date.startsWith(currentMonth)
  );

  const categoryMap: Record<string, number> = {};
  for (const e of currentMonthExpenses) {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + parseFloat(e.amount);
  }

  const totalSpending = Object.values(categoryMap).reduce((a, b) => a + b, 0);

  const recommendations: Array<{
    title: string;
    description: string;
    potentialSaving: number;
    priority: string;
  }> = [];

  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length === 0) {
    recommendations.push({
      title: "Start Tracking Expenses",
      description: "Add your daily expenses to get personalized saving recommendations based on your spending habits.",
      potentialSaving: 0,
      priority: "High",
    });
  } else {
    for (const [category, amount] of sortedCategories.slice(0, 3)) {
      const percentage = (amount / totalSpending) * 100;

      if (category === "Food" && percentage > 30) {
        recommendations.push({
          title: "Reduce Dining & Food Costs",
          description: `Food accounts for ${percentage.toFixed(0)}% of your spending. Try meal prepping and cooking at home more often to cut costs significantly.`,
          potentialSaving: amount * 0.25,
          priority: "High",
        });
      } else if (category === "Entertainment" && percentage > 20) {
        recommendations.push({
          title: "Trim Entertainment Budget",
          description: `Entertainment is ${percentage.toFixed(0)}% of your spending. Review streaming subscriptions and look for free or low-cost alternatives.`,
          potentialSaving: amount * 0.3,
          priority: "Medium",
        });
      } else if (category === "Shopping" && percentage > 25) {
        recommendations.push({
          title: "Review Shopping Habits",
          description: `Shopping is ${percentage.toFixed(0)}% of your budget. Create a wish list and wait 48 hours before non-essential purchases.`,
          potentialSaving: amount * 0.2,
          priority: "High",
        });
      } else if (category === "Transport" && percentage > 20) {
        recommendations.push({
          title: "Optimize Transport Costs",
          description: `Transport is ${percentage.toFixed(0)}% of expenses. Consider carpooling, public transit, or combining errands to reduce costs.`,
          potentialSaving: amount * 0.2,
          priority: "Medium",
        });
      } else {
        recommendations.push({
          title: `Optimize ${category} Spending`,
          description: `${category} represents ${percentage.toFixed(0)}% of your monthly budget. Look for ways to reduce this category by 15-20%.`,
          potentialSaving: amount * 0.15,
          priority: percentage > 25 ? "High" : percentage > 15 ? "Medium" : "Low",
        });
      }
    }

    if (totalSpending > 0) {
      recommendations.push({
        title: "Build an Emergency Fund",
        description: `Aim to save 20% of your income. With your current spending of $${totalSpending.toFixed(2)}/month, even saving $${(totalSpending * 0.1).toFixed(2)} monthly adds up significantly over a year.`,
        potentialSaving: totalSpending * 0.1,
        priority: "Medium",
      });
    }
  }

  res.json(recommendations);
});

export default router;
