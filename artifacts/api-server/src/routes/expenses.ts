import { Router } from "express";
import { db, expensesTable } from "@workspace/db";
import { eq, desc, and, like, sql } from "drizzle-orm";
import {
  CreateExpenseBody,
  DeleteExpenseParams,
  ListExpensesQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/expenses", async (req, res) => {
  const query = ListExpensesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { month, category } = query.data;

  const conditions = [];
  if (month) {
    conditions.push(like(expensesTable.date, `${month}%`));
  }
  if (category) {
    conditions.push(eq(expensesTable.category, category));
  }

  const expenses = await db
    .select()
    .from(expensesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(expensesTable.date));

  res.json(
    expenses.map((e) => ({
      id: e.id,
      amount: parseFloat(e.amount),
      category: e.category,
      description: e.description,
      date: e.date,
      createdAt: e.createdAt.toISOString(),
    }))
  );
});

router.post("/expenses", async (req, res) => {
  const body = CreateExpenseBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body", details: body.error.issues });
    return;
  }

  const [created] = await db
    .insert(expensesTable)
    .values({
      amount: String(body.data.amount),
      category: body.data.category,
      description: body.data.description,
      date: body.data.date,
    })
    .returning();

  res.status(201).json({
    id: created.id,
    amount: parseFloat(created.amount),
    category: created.category,
    description: created.description,
    date: created.date,
    createdAt: created.createdAt.toISOString(),
  });
});

router.delete("/expenses/:id", async (req, res) => {
  const params = DeleteExpenseParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(expensesTable).where(eq(expensesTable.id, params.data.id));
  res.status(204).send();
});

export default router;
