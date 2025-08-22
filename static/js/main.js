// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
    // 夜间模式切换逻辑（保留现有代码）
    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
        themeIcon.classList.remove('fa-moon-o');
        themeIcon.classList.add('fa-sun-o');
    }

    themeToggle.addEventListener('click', () => {
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            themeIcon.classList.remove('fa-sun-o');
            themeIcon.classList.add('fa-moon-o');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.classList.remove('fa-moon-o');
            themeIcon.classList.add('fa-sun-o');
        }
    });

    // 文件上传功能修复
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fileInput = document.querySelector('input[type="file"]');
            if (!fileInput || !fileInput.files.length) {
                alert('请选择要上传的文件');
                return;
            }

            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('file', file);

            try {
                // 显示上传状态
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i>上传中...';

                // 发送上传请求
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert('上传成功: ' + result.message);
                    // 重置表单
                    uploadForm.reset();
                    // 刷新页面以显示新文件
                    location.reload();
                } else {
                    alert('上传失败: ' + (result.error || '未知错误'));
                }
            } catch (error) {
                console.error('上传错误详情:', error);
                alert('上传失败，请检查网络连接或重试');
            } finally {
                // 恢复按钮状态
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                }
            }
        });
    }

    // 文件删除功能修复
    // 使用事件委托确保动态生成的按钮也能触发事件
    document.body.addEventListener('click', async function(e) {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const filename = deleteBtn.getAttribute('data-filename');
            if (!filename) {
                alert('无法获取文件名');
                return;
            }

            if (confirm(`确定要删除文件"${filename}"吗？`)) {
                try {
                    // 显示删除状态
                    const originalIcon = deleteBtn.innerHTML;
                    deleteBtn.disabled = true;
                    deleteBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';

                    // 发送删除请求，确保文件名正确编码
                    const encodedFilename = encodeURIComponent(filename);
                    const response = await fetch(`/delete/${encodedFilename}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        alert('删除成功: ' + result.message);
                        // 刷新页面以更新文件列表
                        location.reload();
                    } else {
                        alert('删除失败: ' + (result.error || '未知错误'));
                    }
                } catch (error) {
                    console.error('删除错误详情:', error);
                    alert('删除失败，请检查网络连接或重试');
                } finally {
                    // 恢复按钮状态
                    if (deleteBtn) {
                        deleteBtn.disabled = false;
                        deleteBtn.innerHTML = originalIcon;
                    }
                }
            }
        }
    });

    // 文件选择显示功能
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const selectedFile = document.getElementById('selected-file');
            const fileNameDisplay = document.getElementById('file-name-display');
            
            if (this.files.length) {
                if (selectedFile && fileNameDisplay) {
                    fileNameDisplay.textContent = this.files[0].name;
                    selectedFile.classList.remove('hidden');
                }
            } else {
                if (selectedFile) {
                    selectedFile.classList.add('hidden');
                }
            }
        });
    }

    // 清除文件选择功能
    const clearFileBtn = document.getElementById('clear-file');
    if (clearFileBtn) {
        clearFileBtn.addEventListener('click', function() {
            const fileInput = document.querySelector('input[type="file"]');
            const selectedFile = document.getElementById('selected-file');
            
            if (fileInput) {
                fileInput.value = '';
            }
            if (selectedFile) {
                selectedFile.classList.add('hidden');
            }
        });
    }
});