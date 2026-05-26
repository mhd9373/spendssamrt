import { Router, type IRouter } from "express";
import healthRouter from "./health";
import expensesRouter from "./expenses";
import analyticsRouter from "./analytics";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(expensesRouter);
router.use(analyticsRouter);
router.use(reportsRouter);

export default router;
