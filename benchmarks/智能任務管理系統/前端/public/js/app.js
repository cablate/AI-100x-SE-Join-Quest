// 任務管理系統前端 JavaScript

// DOM 載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    
    // 初始化工具提示
    initializeTooltips();
    
    // 初始化警告自動關閉
    initializeAlerts();
    
    // 初始化表單驗證
    initializeFormValidation();
    
    // 初始化搜索功能
    initializeSearch();
    
    // 初始化表格功能
    initializeTable();
    
    // 初始化快捷鍵
    initializeKeyboardShortcuts();
    
    console.log('任務管理系統前端已初始化');
});

// 初始化 Bootstrap 工具提示
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// 初始化警告自動關閉
function initializeAlerts() {
    // 自動關閉成功訊息
    setTimeout(function() {
        const successAlerts = document.querySelectorAll('.alert-success');
        successAlerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
}

// 初始化表單驗證
function initializeFormValidation() {
    const forms = document.querySelectorAll('form[data-validate="true"]');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
    
    // 即時驗證
    const inputs = document.querySelectorAll('input[required], textarea[required], select[required]');
    inputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            if (input.value.trim() === '') {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
            } else {
                input.classList.add('is-valid');
                input.classList.remove('is-invalid');
            }
        });
    });
}

// 初始化搜索功能
function initializeSearch() {
    const searchInputs = document.querySelectorAll('input[type="search"]');
    
    searchInputs.forEach(function(input) {
        let searchTimeout;
        
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                performSearch(input.value, input.dataset.target);
            }, 300);
        });
    });
}

// 執行搜索
function performSearch(query, target) {
    if (!target) return;
    
    const targetElement = document.querySelector(target);
    if (!targetElement) return;
    
    const items = targetElement.querySelectorAll('[data-searchable]');
    
    items.forEach(function(item) {
        const text = item.textContent.toLowerCase();
        const searchQuery = query.toLowerCase();
        
        if (text.includes(searchQuery) || searchQuery === '') {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// 初始化表格功能
function initializeTable() {
    // 表格排序
    const sortableHeaders = document.querySelectorAll('th[data-sortable]');
    
    sortableHeaders.forEach(function(header) {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            sortTable(header);
        });
    });
    
    // 批量選擇
    const selectAllCheckbox = document.querySelector('#selectAll');
    const itemCheckboxes = document.querySelectorAll('input[name="selectedItems[]"]');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            itemCheckboxes.forEach(function(checkbox) {
                checkbox.checked = selectAllCheckbox.checked;
            });
            updateBatchActions();
        });
    }
    
    itemCheckboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', updateBatchActions);
    });
}

// 表格排序
function sortTable(header) {
    const table = header.closest('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const columnIndex = Array.from(header.parentNode.children).indexOf(header);
    const isAscending = header.classList.contains('sort-asc');
    
    // 移除所有排序類
    header.parentNode.querySelectorAll('th').forEach(function(th) {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // 添加當前排序類
    header.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
    
    // 排序行
    rows.sort(function(a, b) {
        const aText = a.children[columnIndex].textContent.trim();
        const bText = b.children[columnIndex].textContent.trim();
        
        let aValue = aText;
        let bValue = bText;
        
        // 嘗試轉換為數字
        if (!isNaN(aText) && !isNaN(bText)) {
            aValue = parseFloat(aText);
            bValue = parseFloat(bText);
        }
        
        if (aValue < bValue) return isAscending ? 1 : -1;
        if (aValue > bValue) return isAscending ? -1 : 1;
        return 0;
    });
    
    // 重新排列行
    rows.forEach(function(row) {
        tbody.appendChild(row);
    });
}

// 更新批量操作按鈕狀態
function updateBatchActions() {
    const selectedItems = document.querySelectorAll('input[name="selectedItems[]"]:checked');
    const batchActionButtons = document.querySelectorAll('.batch-action');
    
    if (selectedItems.length > 0) {
        batchActionButtons.forEach(function(button) {
            button.disabled = false;
        });
    } else {
        batchActionButtons.forEach(function(button) {
            button.disabled = true;
        });
    }
}

// 初始化快捷鍵
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + N: 新增
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            const newButton = document.querySelector('a[href*="/new"]');
            if (newButton) {
                newButton.click();
            }
        }
        
        // ESC: 關閉模態框
        if (event.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(function(modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            });
        }
    });
}

// 工具函數
const TaskManager = {
    
    // 確認刪除
    confirmDelete: function(id, name, type = 'item') {
        return confirm(`您確定要刪除${type} "${name}" 嗎？此操作無法復原。`);
    },
    
    // 顯示載入狀態
    showLoading: function(element) {
        if (element) {
            element.innerHTML = '<span class="loading"></span> 載入中...';
            element.disabled = true;
        }
    },
    
    // 隱藏載入狀態
    hideLoading: function(element, originalText) {
        if (element) {
            element.innerHTML = originalText;
            element.disabled = false;
        }
    },
    
    // 顯示通知
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // 自動移除
        setTimeout(function() {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    },
    
    // 格式化日期
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // 獲取狀態顏色
    getStatusColor: function(status) {
        const colors = {
            'pending': 'warning',
            'in_progress': 'primary',
            'completed': 'success',
            'cancelled': 'secondary',
            'active': 'success'
        };
        return colors[status] || 'secondary';
    },
    
    // 獲取優先級顏色
    getPriorityColor: function(priority) {
        const colors = {
            'high': 'danger',
            'medium': 'warning',
            'low': 'info'
        };
        return colors[priority] || 'secondary';
    }
};

// 將工具函數設為全域可用
window.TaskManager = TaskManager;

// 頁面可見性 API - 當用戶切換分頁時暫停更新
let isPageVisible = true;

document.addEventListener('visibilitychange', function() {
    isPageVisible = !document.hidden;
    
    if (isPageVisible) {
        // 頁面重新可見時，可以重新啟動自動更新
        console.log('頁面重新可見');
    } else {
        // 頁面隱藏時，可以暫停不必要的操作
        console.log('頁面已隱藏');
    }
});

// 錯誤處理
window.addEventListener('error', function(event) {
    console.error('頁面錯誤:', event.error);
    TaskManager.showNotification('發生錯誤，請重新整理頁面', 'danger');
});

// 網路狀態監控
window.addEventListener('online', function() {
    TaskManager.showNotification('網路連線已恢復', 'success');
});

window.addEventListener('offline', function() {
    TaskManager.showNotification('網路連線中斷', 'warning');
});