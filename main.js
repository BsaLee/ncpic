// 默认的 Authorization Token
const DEFAULT_AUTH_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NjczMzQ3NzMsImlhdCI6MTc3MjAzODc3MywidG9rZW4iOiJLcnU3SFRaYmVPaHNjTTdDL0Y2d1d5MjhONnM0dmxHL2hkeXFZandIbGZJRHVVV0FrdzRTSlBoengxTTE4bllxbEU3bDlmbDBkV3FPWkhpZmNBMnNpOERKQkFCeXhTVW12YTk4ZkxHVmpzdjlDNHh3NGp2UENMeXRFRlQ4VCtSRnIxdjlDUVRucURIOEw0dVh3Mmt3bERlbUZMMVVDdEgrR1lTNjB6SlRvMEJsakZtblcrMkFDclBKV2toWkRrVUxxTmZRVWRvSWh6bmMwUlBKclVTMjR0UGYwZjc3QnJ2dmZOUkpYT21oTVRhQ3dsVHFvTkRpampuYmNORVdaTmg2RzYxVEoraUVuRHprdnZUVWtrZG5aWWpwSlZXWTBxa1VGQkFZWXpURlVOdkwzNXNibGs4cEs3aDFCOU5Qd1Z4TzNvaE9PY1ZUeDZGOVR6M0N5NWN1MS9EU2tCdWRidEJ6ZmZqbXYwbnhUSE9acXRobUh4a1k2bXBzWnFyajl6M0hrUGVNcWQzY2VlZUJiTXE0M1hNa2daYmZ6Zlh6T1ExbmpxNmJUV0NZUHloT2NLTUZHanFPZnZTeDVhVnJ3N3ZZc0prWWxLeU1JRkgwSk1CbHZucWxNUWs4Rk9YWHNNR1ZKWDBQQngvZDM4RjJyY3ZVTnplQW4rYUlzRVJXYUIzdkFkUnJGYkpEZkdxb2pCL2NmaWlCcWtXTnpkc1A4R0hseWh1UGxoNitUbkpqbmhGVTY4VVZqV3pnNlRybXR5czhSNmx3b2kyakQybmJSblM4QWdoekVscFZSQ2dOR1dUMU9CRFFiR2VOUmZqTndDL2kxWFVodmkreVl4NG0vN2VKZFdEMGxteW5RejI3RittQjJYcklYY3Rkbm15bkJoZWtjWTJ3OUczSEtTalJzd0xPaVR6dFFRMStMczVjV2dUVkVGL2x0ZDZzbGJoNU44cm85ZUsrbWZqd0hSNlZsRFdnSzd0dmRsSjhmNm9iN2svUFh2OTR4UGxnTE8zOElkM2xDZmR1RURxYks4UVJYWmoycWM1WXhzbEQwajNtUXg1N3lhanBPajgzeGgwRE92MDY1RFkrK1FGUHhkaDc5V2pQeFEvUFlVVWRKY3hoMzUxNXk5SmRnREtzUFhKTHEyZm1semRESmtKME5QTT0ifQ.-wWhxboHgxNEXYnFu_yOoXPWPr6RzuYU2B9qThJSjxU';

// 支持的文件扩展名
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const resultsSection = document.getElementById('resultsSection');
const resultsList = document.getElementById('resultsList');
const clearBtn = document.getElementById('clearBtn');
const copyAllBtn = document.getElementById('copyAllBtn');
const statusToast = document.getElementById('statusToast');

// 存储上传结果
let uploadedFiles = [];

// 显示状态消息
function showStatus(message, type = 'info') {
    statusToast.textContent = message;
    statusToast.className = `status-toast show ${type}`;
    setTimeout(() => {
        statusToast.className = 'status-toast';
    }, 3000);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 获取文件扩展名
function getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.')).toLowerCase();
}

// 验证文件类型
function validateFile(file) {
    const ext = getFileExtension(file.name);
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        showStatus(`不支持的文件格式: ${ext}`, 'error');
        return false;
    }
    return true;
}

// 获取上传 Token
async function getUploadToken(authToken) {
    const url = '/api/getUploadToken';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ authToken })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`获取上传Token失败: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        const uploadUrl = result.uploadUrl;
        
        if (!uploadUrl) {
            throw new Error('响应中没有 uploadUrl 字段');
        }
        
        // 从 URL 中提取 token
        const match = uploadUrl.match(/\/upload\/([^/]+)$/);
        if (!match) {
            throw new Error(`无法从 URL 中提取 token: ${uploadUrl}`);
        }
        
        return match[1];
    } catch (error) {
        throw new Error(`获取上传Token失败: ${error.message}`);
    }
}

// 上传文件
async function uploadFile(file, uploadToken) {
    const url = `/api/upload/${uploadToken}`;
    
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            let errorMsg = `上传失败: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.text) {
                    errorMsg += ` - ${errorData.text}`;
                } else {
                    errorMsg += ` - ${JSON.stringify(errorData)}`;
                }
            } catch (e) {
                const errorText = await response.text();
                errorMsg += ` - ${errorText}`;
            }
            throw new Error(errorMsg);
        }
        
        return await response.json();
    } catch (error) {
        throw new Error(`上传失败: ${error.message}`);
    }
}

// 处理单个文件上传
async function handleFileUpload(file) {
    if (!validateFile(file)) {
        return;
    }
    
    showStatus(`正在上传 ${file.name}...`, 'info');
    
    try {
        // 获取上传Token
        const uploadToken = await getUploadToken(DEFAULT_AUTH_TOKEN);
        
        // 上传文件
        const uploadResult = await uploadFile(file, uploadToken);
        
        // 显示结果
        if (uploadResult.upload_result_list && uploadResult.upload_result_list.length > 0) {
            const result = uploadResult.upload_result_list[0];
            addResultItem(file, result);
            showStatus(`${file.name} 上传成功！`, 'success');
        } else {
            throw new Error('上传响应中没有结果');
        }
    } catch (error) {
        showStatus(error.message, 'error');
    }
}

// 添加结果项
function addResultItem(file, result) {
    const viewUrl = result.view_url;
    const bbCode = `[img]${viewUrl}[/img]`;
    
    uploadedFiles.push({ file, result });
    
    const item = document.createElement('div');
    item.className = 'result-item';
    item.innerHTML = `
        <div class="result-preview">
            <img src="${viewUrl}" alt="${file.name}" referrerpolicy="no-referrer">
        </div>
        <div class="result-info">
            <div class="result-input-group">
                <input readonly class="result-input" type="text" value="${viewUrl}" data-copy="${viewUrl}">
                <span class="result-label">URL</span>
            </div>
            <div class="result-input-group">
                <input readonly class="result-input" type="text" value="${bbCode}" data-copy="${bbCode}">
                <span class="result-label">BBCode</span>
            </div>
        </div>
    `;
    
    // 添加点击复制功能
    const inputs = item.querySelectorAll('.result-input');
    inputs.forEach(input => {
        input.addEventListener('click', () => {
            const text = input.dataset.copy;
            copyToClipboard(text);
            input.select();
        });
    });
    
    // 添加图片点击预览功能
    const preview = item.querySelector('.result-preview');
    preview.addEventListener('click', () => {
        window.open(viewUrl, '_blank');
    });
    
    resultsList.appendChild(item);
    resultsSection.style.display = 'block';
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showStatus('已复制到剪贴板', 'success');
    }).catch(() => {
        showStatus('复制失败，请手动复制', 'error');
    });
}

// 处理多个文件
async function handleFiles(files) {
    for (const file of files) {
        await handleFileUpload(file);
    }
}

// 清空结果
clearBtn.addEventListener('click', () => {
    uploadedFiles = [];
    resultsList.innerHTML = '';
    resultsSection.style.display = 'none';
    showStatus('已清空', 'info');
});

// 复制全部
copyAllBtn.addEventListener('click', () => {
    if (uploadedFiles.length === 0) {
        showStatus('没有可复制的内容', 'error');
        return;
    }
    
    const allUrls = uploadedFiles.map(item => item.result.view_url).join('\n');
    copyToClipboard(allUrls);
});

// 事件监听
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
        handleFiles(files);
    }
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        handleFiles(files);
    }
    // 清空 input，允许重复选择同一文件
    fileInput.value = '';
});
