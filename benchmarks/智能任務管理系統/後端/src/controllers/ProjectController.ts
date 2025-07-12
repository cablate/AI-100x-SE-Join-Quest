import { Request, Response } from "express";
import { ProjectService } from "../services/ProjectService";
import { CreateProjectRequest, UpdateProjectRequest } from "../domain/types";

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = ProjectService.getInstance();
  }

  // 創建專案
  createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: CreateProjectRequest = {
        name: req.body.name,
        description: req.body.description,
        ownerId: req.body.ownerId,
      };

      const project = this.projectService.createProject(request);

      res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: project,
      });
    } catch (error: any) {
      res.status(400).json({
        error: "Bad Request",
        message: error.message,
      });
    }
  };

  // 取得專案列表
  getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ownerId, status } = req.query;

      const filters: { ownerId?: string; status?: string } = {};
      if (ownerId) filters.ownerId = ownerId as string;
      if (status) filters.status = status as string;

      const projects = this.projectService.getProjects(filters);

      res.status(200).json({
        success: true,
        message: "Projects retrieved successfully",
        data: {
          projects,
          count: projects.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error.message,
      });
    }
  };

  // 取得特定專案
  getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const project = this.projectService.getProjectById(projectId);

      if (!project) {
        res.status(404).json({
          error: "Project not found",
          message: "專案不存在",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Project retrieved successfully",
        data: project,
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error.message,
      });
    }
  };

  // 更新專案
  updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const request: UpdateProjectRequest = {
        name: req.body.name,
        description: req.body.description,
        status: req.body.status,
        updatedBy: req.body.updatedBy,
      };

      // 驗證必填欄位
      if (!request.updatedBy) {
        res.status(400).json({
          error: "Bad Request",
          message: "更新者ID為必填欄位",
        });
        return;
      }

      const project = this.projectService.updateProject(projectId, request);

      res.status(200).json({
        success: true,
        message: "Project updated successfully",
        data: project,
      });
    } catch (error: any) {
      if (error.message === "專案不存在") {
        res.status(404).json({
          error: "Project not found",
          message: error.message,
        });
      } else if (error.message === "您沒有權限修改此專案") {
        res.status(403).json({
          error: "Permission denied",
          message: error.message,
        });
      } else {
        res.status(400).json({
          error: "Bad Request",
          message: error.message,
        });
      }
    }
  };

  // 刪除專案
  deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const { deletedBy } = req.query;

      if (!deletedBy) {
        res.status(400).json({
          error: "Bad Request",
          message: "刪除者ID為必填參數",
        });
        return;
      }

      const deleted = this.projectService.deleteProject(projectId, deletedBy as string);

      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
        data: {
          projectId,
          deleted,
        },
      });
    } catch (error: any) {
      if (error.message === "專案不存在") {
        res.status(404).json({
          error: "Project not found",
          message: error.message,
        });
      } else if (error.message === "您沒有權限刪除此專案") {
        res.status(403).json({
          error: "Permission denied",
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: "Internal Server Error",
          message: error.message,
        });
      }
    }
  };
}