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

let selectedFile = null;

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
function displayFileInfo(file) {
    if (!validateFile(file)) {
        return false;
    }
    
    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
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

// 处理上传
async function handleUpload() {
    if (!selectedFile) {
        showStatus('请先选择文件', 'error');
        return;
    }
    
    // 重置UI
    uploadBtn.disabled = true;
    progressContainer.classList.add('show');
    progressFill.style.width = '30%';
    result.classList.remove('show');
    hideStatus();
    showStatus('正在获取上传令牌...', 'info');
    
    try {
        // 获取上传Token
        const uploadToken = await getUploadToken(DEFAULT_AUTH_TOKEN);
        progressFill.style.width = '60%';
        showStatus('正在上传文件...', 'info');
        
        // 上传文件
        const result = await uploadFile(selectedFile, uploadToken);
        progressFill.style.width = '100%';
        
        // 显示结果
        if (result.upload_result_list && result.upload_result_list.length > 0) {
            const viewUrlValue = result.upload_result_list[0].view_url;
            viewUrl.textContent = viewUrlValue;
            result.classList.add('show');
            showStatus('上传成功！', 'success');
            
            // 存储查看链接用于复制
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(viewUrlValue).then(() => {
                    copyBtn.textContent = '已复制！';
                    setTimeout(() => {
                        copyBtn.textContent = '复制查看链接';
                    }, 2000);
                }).catch(() => {
                    // 备用方案：选择文本
                    const range = document.createRange();
                    range.selectNode(viewUrl);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                    copyBtn.textContent = '请手动复制';
                });
            };
        } else {
            throw new Error('上传响应中没有结果');
        }
    } catch (error) {
        showStatus(error.message, 'error');
        result.classList.remove('show');
    } finally {
        uploadBtn.disabled = false;
        progressContainer.classList.remove('show');
        progressFill.style.width = '0%';
    }
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
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        displayFileInfo(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        displayFileInfo(e.target.files[0]);
    }
});

uploadBtn.addEventListener('click', handleUpload);

