/*
 * @Author: oliver
 * @Date: 2025-09-08 11:31:46
 * @LastEditors: oliver
 * @LastEditTime: 2025-09-10 13:33:46
 * @Description: 
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
// 导入模拟数据以设置浏览器环境
import './utils/mockData'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)