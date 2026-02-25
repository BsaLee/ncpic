// 默认的 Authorization Token
const DEFAULT_AUTH_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NzMzMzQ3NzMsImlhdCI6MTc3MjAzODc3MywidG9rZW4iOiJLcnU3SFRaYmVPaHNjTTdDL0Y2d1d5MjhONnM0dmxHL2hkeXFZandIbGZJRHVVV0FrdzRTSlBoengxTTE4bllxbEU3bDlmbDBkV3FPWkhpZmNBMnNpOERKQkFCeXhTVW12YTk4ZkxHVmpzdjlDNHh3NGp2UENMeXRFRlQ4VCtSRnIxdjlDUVRucURIOEw0dVh3Mmt3bERlbUZMMVVDdEgrR1lTNjB6SlRvMEJsakZtblcrMkFDclBKV2toWkRrVUxxTmZRVWRvSWh6bmMwUlBKclVTMjR0UGYwZjc3QnJ2dmZOUkpYT21oTVRhQ3dsVHFvTkRpampuYmNORVdaTmg2RzYxVEoraUVuRHprdnZUVWtrZG5aWWpwSlZXWTBxa1VGQkFZWXpURlVOdkwzNXNibGs4cEs3aDFCOU5Qd1Z4TzNvaE9PY1ZUeDZGOVR6M0N5NWN1MS9EU2tCdWRidEJ6ZmZqbXYwbnhUSE9acXRobUh4a1k2bXBzWnFyajl6M0hrUGVNcWQzY2VlZUJiTXE0M1hNa2daYmZ6Zlh6T1ExbmpxNmJUV0NZUHloT2NLTUZHanFPZnZTeDVhVnJ3N3ZZc0prWWxLeU1JRkgwSk1CbHZucWxNUWs4Rk9YWHNNR1ZKWDBQQngvZDM4RjJyY3ZVTnplQW4rYUlzRVJXYUIzdkFkUnJGYkpEZkdxb2pCL2NmaWlCcWtXTnpkc1A4R0hseWh1UGxoNitUbkpqbmhGVTY4VVZqV3pnNlRybXR5czhSNmx3b2kyakQybmJSblM4QWdoekVscFZSQ2dOR1dUMU9CRFFiR2VOUmZqTndDL2kxWFVodmkreVl4NG0vN2VKZFdEMGxteW5RejI3RittQjJYcklYY3Rkbm15bkJoZWtjWTJ3OUczSEtTalJzd0xPaVR6dFFRMStMczVjV2dUVkVGL2x0ZDZzbGJoNU44cm85ZUsrbWZqd0hSNlZsRFdnSzd0dmRsSjhmNm9iN2svUFh2OTR4UGxnTE8zOElkM2xDZmR1RURxYks4UVJYWmoycWM1WXhzbEQwajNtUXg1N3lhanBPajgzeGgwRE92MDY1RFkrK1FGUHhkaDc5V2pQeFEvUFlVVWRKY3hoMzUxNXk5SmRnREtzUFhKTHEyZm1semRESmtKME5QTT0ifQ.-wWhxboHgxNEXYnFu_yOoXPWPr6RzuYU2B9qThJSjxU';

// 支持的文件扩展名
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Content-Type 映射
const CONTENT_TYPE_MAP = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
};

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const uploadBtn = document.getElementById('uploadBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const status = document.getElementById('status');
const result = document.getElementById('result');
const viewUrl = document.getElementById('viewUrl');
const copyBtn = document.getElementById('copyBtn');

let selectedFiles = [];
let uploadedResults = [];

// 复制文本到剪贴板
function copyText(text, buttonId) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById(buttonId);
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '已复制！';
            btn.style.color = '#059669';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.color = '#111827';
            }, 2000);
        }
    }).catch(() => {
        showStatus('复制失败，请手动复制', 'error');
    });
}

// 复制所有 URL
function copyAllUrls() {
    const urls = uploadedResults.map(r => r.view_url).join('\n');
    navigator.clipboard.writeText(urls).then(() => {
        showStatus('已复制所有链接', 'success');
    }).catch(() => {
        showStatus('复制失败，请手动复制', 'error');
    });
}

// 清空所有结果
function clearAllResults() {
    uploadedResults = [];
    viewUrl.innerHTML = '';
    result.classList.remove('show');
    showStatus('已清空', 'info');
}

// 显示状态消息
function showStatus(message, type = 'info') {
    status.textContent = message;
    status.className = `status show ${type}`;
}

// 隐藏状态消息
function hideStatus() {
    status.className = 'status';
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
        showStatus(`不支持的文件格式: ${ext}。支持格式: ${SUPPORTED_EXTENSIONS.join(', ')}`, 'error');
        return false;
    }
    return true;
}

// 显示文件信息
function displayFileInfo(files) {
    const validFiles = [];
    for (const file of files) {
        if (validateFile(file)) {
            validFiles.push(file);
        }
    }
    
    if (validFiles.length === 0) {
        return false;
    }
    
    selectedFiles = validFiles;
    fileName.textContent = validFiles.length === 1 
        ? validFiles[0].name 
        : `已选择 ${validFiles.length} 个文件`;
    
    const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
    fileSize.textContent = formatFileSize(totalSize);
    fileInfo.classList.add('show');
    uploadBtn.disabled = false;
    return true;
}

// 是否使用代理（如果遇到CORS问题，设置为true并使用Worker代理）
const USE_PROXY = true; // 设置为 true 以使用 Worker 代理

// 获取上传 Token
async function getUploadToken(authToken) {
    const url = USE_PROXY 
        ? '/api/getUploadToken' 
        : 'https://lime-api.global.plaync.com/chat/getMediaUploadUrl';
    
    const headers = {
        'User-Agent': 'ncmtalk/6.44.1.0; iOS/16.2;',
        'Content-Type': 'application/json; charset=utf-8',
        'Lime-Device-Name': 'iPhone15,2',
        'Authorization': `Bearer ${authToken}`,
        'X-PP-Sid': '08b11106-22d5-4ec9-af73-be15f88cb0b3',
        'Lime-OS-Version': 'iOS16.2',
        'Lime-API-Version': '166',
        'Lime-App-Version': '6.44.1.0',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'X-Nc-Publisher': 'NCK',
        'Lime-Locale': 'zh_CN',
        'Lime-Trace-Id': 'f04cd538b5634bf7bca4501ade662c44',
        'Lime-Device-Id': '11111111-1234-1234-1234-121764511286'
    };
    
    const data = {
        uploadChannel: 'NGP'
    };
    
    try {
        const fetchOptions = {
            method: 'POST',
            body: JSON.stringify(USE_PROXY ? { authToken } : data)
        };
        
        if (!USE_PROXY) {
            fetchOptions.headers = headers;
        }
        
        const response = await fetch(url, fetchOptions);
        
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
    const url = USE_PROXY
        ? `/api/upload/${uploadToken}`
        : `https://mediamessage-origin.plaync.com/message/upload/${uploadToken}`;
    
    const ext = getFileExtension(file.name);
    const contentType = CONTENT_TYPE_MAP[ext] || 'image/jpeg';
    
    // 准备 FormData
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    const headers = {
        'User-Agent': 'Purple-Global-Std-App/6.44.1 (com.ncsoft.community; build:0; iOS 16.2.0) Alamofire/5.10.2',
        'Accept-Encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
        'Accept-Language': 'zh-Hans;q=1.0',
        'Cookie': '_ga=GA1.1.186217840.1766167334; _ga_3QV2CV6T04=GS2.1.s1766437416$o2$g0$t1766437416$j60$l0$h0; DEF_KEEP_LOGIN=true; GPVLU=F0E1E0644AA60D20FD83BEAB7FFDBE55860401D10053B22E43F6B171866261F705631A246F49D2E1A97D482A86866C4120B1E7A6A3228656A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A846B3EC61A496B54F01BBA18217C1144010C106FFE36E7882DD0919CBDAD50E9461F3BF37B221CF1FF40224F2672A470DA7C9A30A8AFF07D7959DD4C04D57ED84E51D822F865DFD4D8A13765FDE6060F7E; MGPSECEXPIREAT=694CEFE1B1ECFE2A245F11681D2B6262C39215A890E8BD9124811F1437BAF075; MGPVLU=2D8EA27FAF52C9E6B032E18CD9CD6F9E4CEA0F2A481C61AECDE386A20846BF9F7C9D481F0687B707C552A371FEC3695B; NUT=eyJ6aXAiOiJERUYiLCJraWQiOiJlbmMta2V5LTIiLCJjdHkiOiJKV0UiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiQTI1NktXIn0.yPt2HfWssfRoRnhqhjEV8i8ibNDtGpHpv1ey_5KoPAtStuFOlyr4xw.vk0XfNv8o1hN5kzD.ttvq9uVZ4LpYb730DyvY9m1vf_zADda1FTC5Fh5Y9brTpJGGSL6fxzjm-KPdNfW7jT0eeGLgH8_hfQR3AUit6Np0EOQy_-oIzArtLnNxskIXz9mP6HYEZAX0ZZX6YhNLcl81tvwS78E5krbTaJMuGtDQf3ZgBkOy8-wEtEywFhOVPiviZbvzRkKMQENawHE1Ry7WYpINiTDhhHwBrPE6ZlWcvnrhijF0bIha0-f15XYBfQcepDA__ziRF6PVZC1ScdhrS8Px9nDYtLlQ75LKfrh9BiRXPtwhjEN9x5ELCKVZRz_kl4teeNGwLZlZ6e89ttW7DAUa5J39SzhZagE.5Rm_vLxYrdVNCBifdvPFcg; prelogin_country_code=; country=TW; geoLocationInfo=%7B%22isGDPRCountry%22%3Afalse%2C%22geoLocation%22%3A%22HK%22%7D; _ga_EMGG3BZW55=GS2.1.s1766167334$o1$g0$t1766167334$j60$l0$h0; darkMode=dark'
    };
    
    try {
        const fetchOptions = {
            method: 'POST',
            body: formData
        };
        
        if (!USE_PROXY) {
            fetchOptions.headers = headers;
        }
        
        const response = await fetch(url, fetchOptions);
        
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

// 渲染单个上传结果
function renderResult(resultData, index) {
    const viewUrlValue = resultData.view_url;
    const bbCode = `[img]${viewUrlValue}[/img]`;
    const expireAt = resultData.expire_at;
    
    // 格式化过期时间
    let expireText = '永久有效';
    if (expireAt) {
        const expireDate = new Date(expireAt);
        const now = new Date();
        const diffTime = expireDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            expireText = `${diffDays} 天后过期`;
        } else {
            expireText = '已过期';
        }
    }
    
    return `
        <div style="display: flex; gap: 0.75rem; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; margin-bottom: 0.75rem; align-items: flex-start;">
            <div style="position: relative; width: 3.75rem; flex-shrink: 0; overflow: hidden; border-radius: 0.25rem; background: white; cursor: pointer;" onclick="window.open('${viewUrlValue}', '_blank')">
                <div style="padding-bottom: 100%;"></div>
                <img src="${viewUrlValue}" alt="预览" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" referrerpolicy="no-referrer">
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.5rem;">
                    <span style="color: #059669;">✓</span> ${expireText}
                </div>
                <div style="display: flex; align-items: stretch; margin-bottom: 0.5rem;">
                    <input readonly class="result-input" type="text" value="${viewUrlValue}" id="urlInput${index}" style="flex: 1; font-size: 0.75rem; background: #f9fafb; border: 1px solid #e5e7eb; border-right: 1px solid #d1d5db; padding: 0.25rem 0.5rem; font-family: monospace; cursor: pointer; outline: none; min-width: 0;" onclick="copyText('${viewUrlValue}', 'urlCopyBtn${index}'); this.select();">
                    <button onclick="copyText('${viewUrlValue}', 'urlCopyBtn${index}')" id="urlCopyBtn${index}" style="font-size: 0.75rem; color: #111827; white-space: nowrap; font-weight: bold; background: #f9fafb; border: 1px solid #e5e7eb; border-left: 0; padding: 0.25rem 0.5rem; cursor: pointer;">URL</button>
                </div>
                <div style="display: flex; align-items: stretch;">
                    <input readonly class="result-input" type="text" value="${bbCode}" id="bbCodeInput${index}" style="flex: 1; font-size: 0.75rem; background: #f9fafb; border: 1px solid #e5e7eb; border-right: 1px solid #d1d5db; padding: 0.25rem 0.5rem; font-family: monospace; cursor: pointer; outline: none; min-width: 0;" onclick="copyText('${bbCode}', 'bbCodeCopyBtn${index}'); this.select();">
                    <button onclick="copyText('${bbCode}', 'bbCodeCopyBtn${index}')" id="bbCodeCopyBtn${index}" style="font-size: 0.75rem; color: #111827; white-space: nowrap; font-weight: bold; background: #f9fafb; border: 1px solid #e5e7eb; border-left: 0; padding: 0.25rem 0.5rem; cursor: pointer;">BBCode</button>
                </div>
            </div>
        </div>
    `;
}

// 更新结果显示
function updateResultsDisplay() {
    if (uploadedResults.length === 0) {
        result.classList.remove('show');
        return;
    }
    
    const header = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h3 style="font-size: 1.125rem; font-weight: 500; color: #111827;">上传成功 (${uploadedResults.length})</h3>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="clearAllResults()" style="font-size: 0.875rem; color: #4b5563; background: none; border: none; cursor: pointer; padding: 0.25rem 0.5rem;">清空</button>
                <button onclick="copyAllUrls()" style="font-size: 0.875rem; color: #4b5563; background: none; border: none; cursor: pointer; padding: 0.25rem 0.5rem;">复制全部</button>
            </div>
        </div>
    `;
    
    const results = uploadedResults.map((r, i) => renderResult(r, i)).join('');
    viewUrl.innerHTML = header + results;
    result.classList.add('show');
}

// 处理上传
async function handleUpload() {
    if (selectedFiles.length === 0) {
        showStatus('请先选择文件', 'error');
        return;
    }
    
    // 重置UI
    uploadBtn.disabled = true;
    progressContainer.classList.add('show');
    hideStatus();
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const progress = ((i + 1) / selectedFiles.length) * 100;
        progressFill.style.width = `${progress}%`;
        showStatus(`正在上传 ${i + 1}/${selectedFiles.length}: ${file.name}`, 'info');
        
        try {
            // 获取上传Token
            const uploadToken = await getUploadToken(DEFAULT_AUTH_TOKEN);
            
            // 上传文件
            const uploadResult = await uploadFile(file, uploadToken);
            
            // 保存结果
            if (uploadResult.upload_result_list && uploadResult.upload_result_list.length > 0) {
                uploadedResults.push(uploadResult.upload_result_list[0]);
                successCount++;
                updateResultsDisplay();
            }
        } catch (error) {
            console.error(`上传 ${file.name} 失败:`, error);
            failCount++;
        }
    }
    
    // 显示最终结果
    progressFill.style.width = '100%';
    if (failCount === 0) {
        showStatus(`全部上传成功！(${successCount} 个文件)`, 'success');
    } else {
        showStatus(`上传完成：成功 ${successCount} 个，失败 ${failCount} 个`, 'error');
    }
    
    // 重置
    uploadBtn.disabled = false;
    progressContainer.classList.remove('show');
    progressFill.style.width = '0%';
    selectedFiles = [];
    fileInfo.classList.remove('show');
}

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
        displayFileInfo(files);
    }
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        displayFileInfo(files);
    }
});

uploadBtn.addEventListener('click', handleUpload);

