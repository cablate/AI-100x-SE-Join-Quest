const express = require('express');
const axios = require('axios');
const router = express.Router();

const userId = 'user123'; // 暫時固定使用者

// 專案列表頁面
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const params = { ownerId: userId };
    if (status) params.status = status;
    
    const response = await axios.get('/api/projects', { params });
    const projects = response.data.data?.projects || [];
    
    res.render('projects/index', {
      title: '專案管理',
      projects,
      filters: { status }
    });
  } catch (error) {
    res.render('shared/error', {
      title: '載入專案失敗',
      message: error.message,
      error
    });
  }
});

// 新增專案頁面
router.get('/new', (req, res) => {
  res.render('projects/new', {
    title: '新增專案'
  });
});

// 建立專案
router.post('/', async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      ownerId: userId
    };
    
    await axios.post('/api/projects', projectData);
    res.redirect('/projects?success=created');
  } catch (error) {
    res.render('projects/new', {
      title: '新增專案',
      error: error.response?.data?.message || error.message,
      formData: req.body
    });
  }
});

// 專案詳情頁面
router.get('/:projectId', async (req, res) => {
  try {
    const [projectResponse, tasksResponse] = await Promise.all([
      axios.get(`/api/projects/${req.params.projectId}`),
      axios.get('/api/tasks', { params: { userId, projectId: req.params.projectId } })
    ]);
    
    const project = projectResponse.data.data;
    const tasks = tasksResponse.data.data?.tasks || [];
    
    res.render('projects/detail', {
      title: `專案: ${project.name}`,
      project,
      tasks
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).render('shared/error', {
        title: '專案不存在',
        message: '找不到指定的專案',
        error: { status: 404 }
      });
    }
    
    res.render('shared/error', {
      title: '載入專案詳情失敗',
      message: error.message,
      error
    });
  }
});

// 編輯專案頁面
router.get('/:projectId/edit', async (req, res) => {
  try {
    const response = await axios.get(`/api/projects/${req.params.projectId}`);
    const project = response.data.data;
    
    res.render('projects/edit', {
      title: '編輯專案',
      project
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).render('shared/error', {
        title: '專案不存在',
        message: '找不到指定的專案',
        error: { status: 404 }
      });
    }
    
    res.render('shared/error', {
      title: '載入編輯專案頁面失敗',
      message: error.message,
      error
    });
  }
});

// 更新專案
router.post('/:projectId', async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      updatedBy: userId
    };
    
    await axios.put(`/api/projects/${req.params.projectId}`, projectData);
    res.redirect('/projects?success=updated');
  } catch (error) {
    res.redirect(`/projects/${req.params.projectId}/edit?error=${encodeURIComponent(error.response?.data?.message || error.message)}`);
  }
});

// 刪除專案
router.post('/:projectId/delete', async (req, res) => {
  try {
    await axios.delete(`/api/projects/${req.params.projectId}`, {
      params: { deletedBy: userId }
    });
    res.redirect('/projects?success=deleted');
  } catch (error) {
    res.redirect(`/projects?error=${encodeURIComponent(error.response?.data?.message || error.message)}`);
  }
});

module.exports = router;