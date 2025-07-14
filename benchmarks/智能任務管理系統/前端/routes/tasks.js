const express = require('express');
const axios = require('axios');
const router = express.Router();

const userId = 'user123'; // 暫時固定使用者

// 任務列表頁面
router.get('/', async (req, res) => {
  try {
    const { status, priority, projectId } = req.query;
    const params = { userId, status, priority, projectId };
    
    // 移除空值參數
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    
    const response = await axios.get('/api/tasks/query', { params });
    const tasks = response.data.tasks || [];
    const statistics = response.data.statistics || {};
    
    // 獲取專案列表用於篩選
    const projectsResponse = await axios.get('/api/projects');
    const projects = projectsResponse.data.data?.projects || [];
    
    res.render('tasks/index', {
      title: '任務管理',
      tasks,
      statistics,
      projects,
      filters: { status, priority, projectId }
    });
  } catch (error) {
    res.render('shared/error', {
      title: '載入任務失敗',
      message: error.message,
      error
    });
  }
});

// 新增任務頁面
router.get('/new', async (req, res) => {
  try {
    const projectsResponse = await axios.get('/api/projects');
    const projects = projectsResponse.data.data?.projects || [];
    
    res.render('tasks/new', {
      title: '新增任務',
      projects
    });
  } catch (error) {
    res.render('shared/error', {
      title: '載入新增任務頁面失敗',
      message: error.message,
      error
    });
  }
});

// 建立任務
router.post('/', async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      creatorId: userId
    };
    
    await axios.post('/api/tasks', taskData);
    res.redirect('/tasks?success=created');
  } catch (error) {
    const projectsResponse = await axios.get('/api/projects');
    const projects = projectsResponse.data.data?.projects || [];
    
    res.render('tasks/new', {
      title: '新增任務',
      projects,
      error: error.response?.data?.message || error.message,
      formData: req.body
    });
  }
});

// 編輯任務頁面
router.get('/:taskId/edit', async (req, res) => {
  try {
    const [tasksResponse, projectsResponse] = await Promise.all([
      axios.get(`/api/tasks?userId=${userId}`),
      axios.get('/api/projects')
    ]);
    
    const tasks = tasksResponse.data.data?.tasks || [];
    const task = tasks.find(t => t.id === req.params.taskId);
    
    if (!task) {
      return res.status(404).render('shared/error', {
        title: '任務不存在',
        message: '找不到指定的任務',
        error: { status: 404 }
      });
    }
    
    const projects = projectsResponse.data.data?.projects || [];
    
    res.render('tasks/edit', {
      title: '編輯任務',
      task,
      projects
    });
  } catch (error) {
    res.render('shared/error', {
      title: '載入編輯任務頁面失敗',
      message: error.message,
      error
    });
  }
});

// 更新任務
router.post('/:taskId', async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      updatedBy: userId
    };
    
    await axios.put(`/api/tasks/${req.params.taskId}`, taskData);
    res.redirect('/tasks?success=updated');
  } catch (error) {
    res.redirect(`/tasks/${req.params.taskId}/edit?error=${encodeURIComponent(error.response?.data?.message || error.message)}`);
  }
});

// 刪除任務
router.post('/:taskId/delete', async (req, res) => {
  try {
    await axios.delete(`/api/tasks/${req.params.taskId}`, {
      params: { deletedBy: userId }
    });
    res.redirect('/tasks?success=deleted');
  } catch (error) {
    res.redirect(`/tasks?error=${encodeURIComponent(error.response?.data?.message || error.message)}`);
  }
});

module.exports = router;