import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";

const router = Router();
const projectController = new ProjectController();

// 專案相關路由
router.post("/", projectController.createProject);           // POST /api/projects
router.get("/", projectController.getProjects);              // GET /api/projects
router.get("/:projectId", projectController.getProjectById); // GET /api/projects/:projectId
router.put("/:projectId", projectController.updateProject);  // PUT /api/projects/:projectId
router.delete("/:projectId", projectController.deleteProject); // DELETE /api/projects/:projectId

export default router;