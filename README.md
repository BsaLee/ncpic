# NC 图床上传工具 - Web 版本

一个基于 HTML/JavaScript 的图床上传工具，可以部署到 Cloudflare Pages。

> 这是 Web 版本，Python 版本请查看项目根目录的 README.md

## 功能特点

- 🚀 简洁美观的界面
- 📁 支持拖拽上传
- 🖼️ 支持 JPG、PNG、GIF、WEBP 格式
- 🔄 自动获取上传 Token
- 📋 一键复制查看链接

## 部署到 Cloudflare Pages

### 方法一：通过 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 部分
3. 点击 **Create a project**
4. 选择 **Upload assets**
5. 上传以下文件：
   - `index.html`
   - `main.js`
6. 点击 **Deploy site**

### 方法二：通过 Wrangler CLI

1. 安装 Wrangler CLI：
```bash
npm install -g wrangler
```

2. 登录 Cloudflare：
```bash
wrangler login
```

3. 部署：
```bash
wrangler pages deploy .
```

### 方法三：通过 Git 仓库

1. 将代码推送到 GitHub/GitLab
2. 在 Cloudflare Dashboard 中连接 Git 仓库
3. 选择构建设置：
   - **Build command**: (留空)
   - **Build output directory**: `/`
4. 点击 **Save and Deploy**

## 本地开发

在 `pages` 目录下，直接在浏览器中打开 `index.html` 即可，或使用本地服务器：

```bash
# 进入 pages 目录
cd pages

# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx http-server

# 使用 PHP
php -S localhost:8000
```

然后在浏览器中访问 `http://localhost:8000`

## 注意事项

⚠️ **CORS 限制**：由于浏览器的 CORS 策略，直接从浏览器调用 NC 图床 API 可能会遇到跨域问题。

如果遇到 CORS 错误，有以下解决方案：

### 方案 1：使用 Cloudflare Workers 作为代理

创建一个 `_worker.js` 文件：

```javascript
export default {
  async fetch(request) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // 代理请求到 NC 图床 API
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      const targetUrl = request.url.replace('/api/', 'https://');
      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      const response = await fetch(modifiedRequest);
      const modifiedResponse = new Response(response.body, response);
      modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
      return modifiedResponse;
    }

    return fetch(request);
  },
};
```

### 方案 2：使用浏览器扩展

安装 CORS 解除扩展（仅用于开发测试）

### 方案 3：修改代码使用代理 API

修改 `main.js` 中的 API 地址，使用自己的后端代理服务。

## 文件说明

- `index.html` - 主页面
- `main.js` - 核心逻辑
- `_worker.js` - Cloudflare Workers 代理（用于解决 CORS 问题）
- `wrangler.toml` - Wrangler 配置文件
- `README.md` - 说明文档

## 许可证

MIT License

