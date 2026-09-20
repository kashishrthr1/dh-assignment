import { Router } from "express";
import { adminGetUsers, adminUpdateUser, adminGetReports } from "../controllers/adminController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", adminGetUsers);
router.patch("/users/:id", adminUpdateUser);
router.get("/reports", adminGetReports);

export default router;
