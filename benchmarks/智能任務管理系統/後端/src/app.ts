import express from "express";
import taskRoutes from "./routes/taskRoutes";
import projectRoutes from "./routes/projectRoutes";

const app = express();

// 中間件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);

// 健康檢查
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 處理
app.use("*", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
