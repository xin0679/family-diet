/**
 * Service Worker - Family Diet PWA
 * 实现离线缓存和后台同步
 */

const CACHE_NAME = 'family-diet-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/data.js',
  '/js/bazi.js',
  '/js/health.js',
  '/js/recipes.js',
  '/js/app.js',
  '/manifest.json'
];

// 安装阶段：缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.error('[SW] Cache failed:', err);
      })
  );
  
  // 立即激活新的 Service Worker
  self.skipWaiting();
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // 立即接管所有页面
  self.clients.claim();
});

// 拦截请求：优先从缓存读取
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }
  
  const { request } = event;
  const url = new URL(request.url);
  
  // 策略1：导航请求（HTML页面）- 网络优先，失败回退缓存
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 更新缓存
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // 如果连缓存都没有，返回离线页面
            return caches.match('/index.html');
          });
        })
    );
    return;
  }
  
  // 策略2：静态资源（CSS/JS/图片）- 缓存优先
  if (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          // 缓存命中，返回缓存
          // 后台更新缓存
          fetch(request).then((fetchResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, fetchResponse);
            });
          }).catch(() => {});
          return response;
        }
        
        // 缓存未命中，从网络获取并缓存
        return fetch(request).then((fetchResponse) => {
          const clone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return fetchResponse;
        });
      })
    );
    return;
  }
  
  // 策略3：其他请求 - 网络优先，失败回退缓存
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 更新缓存
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// 后台同步（用于离线数据同步）
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // 这里可以实现离线数据同步逻辑
  console.log('[SW] Syncing data...');
}

// 推送通知（可选功能）
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '今日食谱推荐已更新',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'family-diet',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: '查看'
      },
      {
        action: 'close',
        title: '关闭'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || '家庭食谱',
      options
    )
  );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
