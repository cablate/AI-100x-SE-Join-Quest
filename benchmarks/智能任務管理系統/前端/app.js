const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// 設定 EJS 模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 靜態檔案
app.use(express.static(path.join(__dirname, 'public')));

// 解析 JSON 和 URL 編碼資料
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 設定 axios 預設值
axios.defaults.baseURL = API_BASE_URL;

// 路由
app.use('/', require('./routes/index'));
app.use('/tasks', require('./routes/tasks'));
app.use('/projects', require('./routes/projects'));

// 404 處理
app.use('*', (req, res) => {
  res.status(404).render('shared/error', {
    title: '頁面不存在',
    message: '找不到您要的頁面',
    error: { status: 404 }
  });
});

// 錯誤處理
app.use((err, req, res, next) => {
  res.status(err.status || 500).render('shared/error', {
    title: '發生錯誤',
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`前端伺服器運行在 http://localhost:${PORT}`);
  console.log(`後端 API 位址: ${API_BASE_URL}`);
});

module.exports = app;