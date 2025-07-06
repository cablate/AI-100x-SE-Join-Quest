import { Project } from "../domain/Project";
import { CreateProjectRequest, UpdateProjectRequest } from "../domain/types";

export class ProjectService {
  private static instance: ProjectService;
  private projects: Map<string, Project> = new Map();
  private projectNameIndex: Set<string> = new Set(); // 用於檢查重複名稱

  private constructor() {}

  static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  // 清理所有專案資料（測試用）
  static clearAll(): void {
    if (ProjectService.instance) {
      ProjectService.instance.projects.clear();
      ProjectService.instance.projectNameIndex.clear();
    }
  }

  createProject(request: CreateProjectRequest): Project {
    // 驗證必填欄位
    if (!request.name || request.name.trim() === "") {
      throw new Error("專案名稱為必填欄位");
    }
    if (!request.description || request.description.trim() === "") {
      throw new Error("專案描述為必填欄位");
    }
    if (!request.ownerId || request.ownerId.trim() === "") {
      throw new Error("專案擁有者為必填欄位");
    }

    // 檢查專案名稱是否重複
    if (this.projectNameIndex.has(request.name)) {
      throw new Error("專案名稱已存在");
    }

    // 生成專案ID
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // 創建專案
    const project = new Project(projectId, request.name, request.description, request.ownerId);

    // 保存到記憶體
    this.projects.set(projectId, project);
    this.projectNameIndex.add(request.name);

    return project;
  }

  updateProject(projectId: string, request: UpdateProjectRequest): Project {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error("專案不存在");
    }

    // 權限檢查：只有擁有者可以修改專案
    if (project.ownerId !== request.updatedBy) {
      throw new Error("您沒有權限修改此專案");
    }

    // 狀態轉換驗證
    if (request.status && project.status === "completed" && request.status === "active") {
      throw new Error("無法將已完成的專案狀態改回進行中");
    }

    // 名稱重複檢查
    if (request.name && request.name !== project.name) {
      if (this.projectNameIndex.has(request.name)) {
        throw new Error("專案名稱已存在");
      }
      // 更新名稱索引
      this.projectNameIndex.delete(project.name);
      this.projectNameIndex.add(request.name);
    }

    // 更新專案
    const updatedProject = project.update({
      name: request.name,
      description: request.description,
      status: request.status,
    });

    this.projects.set(projectId, updatedProject);
    return updatedProject;
  }

  getProjects(filters?: { ownerId?: string; status?: string }): Project[] {
    let projectList = Array.from(this.projects.values());

    if (filters) {
      if (filters.ownerId) {
        projectList = projectList.filter((project) => project.ownerId === filters.ownerId);
      }
      if (filters.status) {
        projectList = projectList.filter((project) => project.status === filters.status);
      }
    }

    return projectList;
  }

  getProjectById(projectId: string): Project | null {
    return this.projects.get(projectId) || null;
  }

  deleteProject(projectId: string, deletedBy: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error("專案不存在");
    }

    // 權限檢查：只有擁有者可以刪除專案
    if (project.ownerId !== deletedBy) {
      throw new Error("您沒有權限刪除此專案");
    }

    // 從索引中移除名稱
    this.projectNameIndex.delete(project.name);

    // 刪除專案
    return this.projects.delete(projectId);
  }
}
