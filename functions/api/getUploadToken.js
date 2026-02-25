// 处理获取上传 Token 的请求
export async function onRequestPost(context) {
  const request = context.request;
  
  try {
    // 克隆请求以避免 body 被消费的问题
    const clonedRequest = request.clone();
    
    // 检查 Content-Type
    const contentType = clonedRequest.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ 
        error: 'Content-Type must be application/json',
        received: contentType 
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 400,
      });
    }

    // 读取请求体文本
    const bodyText = await clonedRequest.text();
    
    // 检查请求体是否为空
    if (!bodyText || bodyText.trim() === '') {
      return new Response(JSON.stringify({ 
        error: 'Request body is empty' 
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 400,
      });
    }

    // 解析 JSON
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError.message,
        received: bodyText.substring(0, 100)
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 400,
      });
    }

    const authToken = body.authToken || body.authorization_token;
    
    if (!authToken) {
      return new Response(JSON.stringify({ 
        error: 'authToken is required' 
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 400,
      });
    }
    
    const proxyRequest = new Request('https://lime-api.global.plaync.com/chat/getMediaUploadUrl', {
      method: 'POST',
      headers: {
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
      },
      body: JSON.stringify({ uploadChannel: 'NGP' })
    });
    
    const response = await fetch(proxyRequest);
    const responseText = await response.text();
    
    // 尝试解析响应
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: 'Invalid response from upstream API',
        details: responseText.substring(0, 200)
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 502,
      });
    }
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: response.status,
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    });
  }
}

// 处理 CORS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
