// Cloudflare Pages Functions - 用于解决 CORS 问题
// 这个文件只处理 /api/* 路径的请求
export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  
  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent, Accept-Language, Cookie, X-PP-Sid, Lime-Device-Name, Lime-OS-Version, Lime-API-Version, Lime-App-Version, X-Nc-Publisher, Lime-Locale, Lime-Trace-Id, Lime-Device-Id, Accept-Encoding',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 代理获取上传 Token 的请求
  if (url.pathname === '/api/getUploadToken') {
    try {
      const body = await request.json();
      const authToken = body.authToken || body.authorization_token;
      
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
      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: response.status,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 500,
      });
    }
  }
  
  // 代理文件上传请求
  if (url.pathname.startsWith('/api/upload/')) {
    try {
      const uploadToken = url.pathname.replace('/api/upload/', '');
      const formData = await request.formData();
      
      const proxyRequest = new Request(`https://mediamessage-origin.plaync.com/message/upload/${uploadToken}`, {
        method: 'POST',
        headers: {
          'User-Agent': 'Purple-Global-Std-App/6.44.1 (com.ncsoft.community; build:0; iOS 16.2.0) Alamofire/5.10.2',
          'Accept-Encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
          'Accept-Language': 'zh-Hans;q=1.0',
          'Cookie': '_ga=GA1.1.186217840.1766167334; _ga_3QV2CV6T04=GS2.1.s1766437416$o2$g0$t1766437416$j60$l0$h0; DEF_KEEP_LOGIN=true; GPVLU=F0E1E0644AA60D20FD83BEAB7FFDBE55860401D10053B22E43F6B171866261F705631A246F49D2E1A97D482A86866C4120B1E7A6A3228656A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A84A54BBC1AD70B1A846B3EC61A496B54F01BBA18217C1144010C106FFE36E7882DD0919CBDAD50E9461F3BF37B221CF1FF40224F2672A470DA7C9A30A8AFF07D7959DD4C04D57ED84E51D822F865DFD4D8A13765FDE6060F7E; MGPSECEXPIREAT=694CEFE1B1ECFE2A245F11681D2B6262C39215A890E8BD9124811F1437BAF075; MGPVLU=2D8EA27FAF52C9E6B032E18CD9CD6F9E4CEA0F2A481C61AECDE386A20846BF9F7C9D481F0687B707C552A371FEC3695B; NUT=eyJ6aXAiOiJERUYiLCJraWQiOiJlbmMta2V5LTIiLCJjdHkiOiJKV0UiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiQTI1NktXIn0.yPt2HfWssfRoRnhqhjEV8i8ibNDtGpHpv1ey_5KoPAtStuFOlyr4xw.vk0XfNv8o1hN5kzD.ttvq9uVZ4LpYb730DyvY9m1vf_zADda1FTC5Fh5Y9brTpJGGSL6fxzjm-KPdNfW7jT0eeGLgH8_hfQR3AUit6Np0EOQy_-oIzArtLnNxskIXz9mP6HYEZAX0ZZX6YhNLcl81tvwS78E5krbTaJMuGtDQf3ZgBkOy8-wEtEywFhOVPiviZbvzRkKMQENawHE1Ry7WYpINiTDhhHwBrPE6ZlWcvnrhijF0bIha0-f15XYBfQcepDA__ziRF6PVZC1ScdhrS8Px9nDYtLlQ75LKfrh9BiRXPtwhjEN9x5ELCKVZRz_kl4teeNGwLZlZ6e89ttW7DAUa5J39SzhZagE.5Rm_vLxYrdVNCBifdvPFcg; prelogin_country_code=; country=TW; geoLocationInfo=%7B%22isGDPRCountry%22%3Afalse%2C%22geoLocation%22%3A%22HK%22%7D; _ga_EMGG3BZW55=GS2.1.s1766437416$o1$g0$t1766437416$j60$l0$h0; darkMode=dark'
        },
        body: formData
      });
      
      const response = await fetch(proxyRequest);
      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: response.status,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 500,
      });
    }
  }
  
  // 如果路径不匹配，返回 404
  return new Response('Not Found', { status: 404 });
}

