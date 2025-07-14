const express = require('express');
const axios = require('axios');
const router = express.Router();

// 首頁
router.get('/', async (req, res) => {
  try {
    // 獲取系統狀態
    const healthResponse = await axios.get('/health');
    
    // 獲取基本統計資料
    const userId = 'user123'; // 暫時固定使用者
    
    const [tasksResponse, projectsResponse] = await Promise.all([
      axios.get('/api/tasks', { params: { userId } }),
      axios.get('/api/projects', { params: { ownerId: userId } })
    ]);

    const tasks = tasksResponse.data.data?.tasks || [];
    const projects = projectsResponse.data.data?.projects || [];

    // 計算統計資料
    const stats = {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(task => task.status === 'pending' || task.status === 'TODO').length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      totalProjects: projects.length,
      activeProjects: projects.filter(project => project.status === 'active').length
    };

    res.render('index', {
      title: '任務管理系統',
      stats,
      recentTasks: tasks.slice(0, 5),
      recentProjects: projects.slice(0, 5),
      systemStatus: healthResponse.data.status
    });
  } catch (error) {
    console.error('載入首頁資料失敗:', error.message);
    res.render('index', {
      title: '任務管理系統',
      stats: { totalTasks: 0, pendingTasks: 0, completedTasks: 0, totalProjects: 0, activeProjects: 0 },
      recentTasks: [],
      recentProjects: [],
      systemStatus: 'error',
      error: '無法連接到後端服務'
    });
  }
});

module.exports = router;