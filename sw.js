const CACHE='ouvertures-v12';
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>
    fetch(new Request(f,{cache:'reload'})).then(r=>r.ok?c.put(f,r):null).catch(()=>null)
  ))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const isPage=r.mode==='navigate'||(r.headers.get('accept')||'').includes('text/html');
  if(isPage){
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{
      const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy));return res;
    }).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{
    const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy));return res;
  })));
});
