import { Router } from "express";
import * as controller from "../controllers/task.controller";
import validate from "../middlewares/validate";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.schema";
import { authMiddleware } from "../middlewares/auth";
import { validateUUID } from "../middlewares/validateUUID";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createTaskSchema), controller.createTask);
router.get("/", controller.getTasks);
router.get("/:id", validateUUID(), controller.getTaskById);
router.put("/:id", validateUUID(), validate(updateTaskSchema), controller.updateTask);
router.delete("/:id", validateUUID(), controller.deleteTask);

export default router;
