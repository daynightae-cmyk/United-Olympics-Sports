import { chromium } from 'playwright';
import fs from 'node:fs';

const base = 'http://127.0.0.1:3000';
const KEY = 'uos:ui-settings:v1';
const defaults = { appearance:'system', bilingualOrder:'en-first', density:'comfortable', motion:'system', fontScale:'default', sidebarDefault:'expanded' };
const publicRoutes = ['/', '/about', '/sports', '/sports/football', '/sports/swimming', '/sports/basketball', '/sports/tennis', '/sports/gymnastics', '/sports/martial-arts', '/programs', '/programs/football-foundations', '/programs/swimming-progressive', '/programs/basketball-team-performance', '/programs/tennis-individual-skills', '/coaches', '/contact'];
const productRoutes = ['/player','/parent','/coach'];
const adminRoutes = ['/admin','/admin/sports','/admin/sports/football','/admin/sports/swimming','/admin/sports/basketball','/admin/players','/admin/players/player-demo-001','/admin/groups','/admin/parents','/admin/coaches','/admin/programs','/admin/schedules','/admin/attendance','/admin/performance','/admin/countries','/admin/branches','/admin/subscriptions','/admin/payments','/admin/reports','/admin/content','/admin/users','/admin/settings'];
const routes = [...publicRoutes,...productRoutes,...adminRoutes];
const viewports = [[1920,1080],[1600,900],[1440,900],[1366,768],[1280,800],[1024,768],[820,1180],[768,1024],[430,932],[414,896],[390,844],[375,812],[360,800],[320,700]];
const responsiveRoutes = ['/','/sports/football','/programs','/parent','/coach','/admin','/admin/players','/admin/settings'];
const report = { routes:{}, responsive:{}, settings:{}, fouc:{}, tabs:{}, images:{}, bilingual:{}, consoleErrors:[], status:'RUNNING' };
const browser = await chromium.launch({ headless:true });
const fail = (message) => { throw new Error(message); };
const assert = (condition,message) => { if(!condition) fail(message); };
const sleep = (ms) => new Promise((resolve)=>setTimeout(resolve,ms));

async function seed(page, settings, splashSeen=true){
  await page.addInitScript(({ key, value, splashSeen }) => {
    if (sessionStorage.getItem('__uos-qa-seeded') === '1') return;
    localStorage.setItem(key, JSON.stringify(value));
    if (splashSeen) sessionStorage.setItem('uos:splash-seen','1'); else sessionStorage.removeItem('uos:splash-seen');
    sessionStorage.setItem('__uos-qa-seeded','1');
  }, { key:KEY, value:settings, splashSeen });
}
async function forceImages(page){
  await page.evaluate(async () => {
    const step = Math.max(500, Math.floor(innerHeight * .8));
    for(let y=0;y<document.documentElement.scrollHeight;y+=step){ scrollTo(0,y); await new Promise(r=>setTimeout(r,18)); }
    scrollTo(0,0);
  });
  await sleep(80);
}
async function assertSurface(page,key,theme){
  await page.waitForSelector('#root > *',{timeout:8000});
  const text = (await page.locator('body').innerText()).trim();
  assert(text.length>180,`Thin/blank route ${key}: ${text.length}`);
  const state = await page.evaluate(() => ({ theme:document.documentElement.dataset.theme, scrollWidth:document.documentElement.scrollWidth, clientWidth:document.documentElement.clientWidth }));
  assert(state.theme===theme,`Wrong theme ${key}: ${state.theme}`);
  assert(state.scrollWidth<=state.clientWidth+1,`Overflow ${key}: ${state.scrollWidth}/${state.clientWidth}`);
  const brokenBi = await page.locator('.bi').evaluateAll(nodes=>nodes.filter(n=>!n.querySelector('.bi-en')||!n.querySelector('.bi-ar')).length);
  const legacyBroken = await page.locator('.en').evaluateAll(nodes=>nodes.filter(n=>!n.parentElement?.querySelector(':scope > .ar')).length);
  assert(brokenBi===0,`Broken .bi ${key}: ${brokenBi}`);
  assert(legacyBroken===0,`Broken legacy bilingual pair ${key}: ${legacyBroken}`);
  await forceImages(page);
  const brokenImages = await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src')));
  assert(brokenImages.length===0,`Broken images ${key}: ${brokenImages.join(',')}`);
  report.routes[key]={theme,textLength:text.length}; report.images[key]=brokenImages; report.bilingual[key]={brokenBi,legacyBroken};
}

try{
  for(const theme of ['light','dark']){
    const context = await browser.newContext({viewport:{width:1600,height:900},colorScheme:theme});
    const page = await context.newPage();
    await seed(page,{...defaults,appearance:theme});
    page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(`${theme}:${page.url()}:${m.text()}`)});
    for(const route of routes){
      await page.goto(base+route,{waitUntil:'domcontentloaded'});
      await assertSurface(page,`${theme}:${route}`,theme);
      if(productRoutes.includes(route)) assert(await page.locator('.theme-menu-trigger').count()>=1,`Missing product theme control ${route}`);
      if(route.startsWith('/admin')) assert(await page.locator('.theme-menu-trigger').count()>=1,`Missing Admin theme control ${route}`);
      if(publicRoutes.includes(route)) assert(await page.locator('.site-header .theme-menu-trigger').count()>=1,`Missing public theme control ${route}`);
    }
    await context.close();
  }

  const context = await browser.newContext({viewport:{width:1440,height:900},colorScheme:'light'});
  const page = await context.newPage();
  await seed(page,{...defaults,appearance:'light'});
  await page.goto(base+'/admin/settings',{waitUntil:'domcontentloaded'});
  const clickSetting = async (name) => { const target=page.getByRole('button',{name:new RegExp(name,'i')}).first(); await target.click(); await sleep(80); };

  await clickSetting('Night Mode');
  assert(await page.evaluate(()=>document.documentElement.dataset.theme)==='dark','Night setting did not apply');
  let stored = await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)),KEY); assert(stored.appearance==='dark','Night not persisted');
  await page.reload({waitUntil:'domcontentloaded'}); assert(await page.evaluate(()=>document.documentElement.dataset.theme)==='dark','Night lost after refresh');
  await page.goto(base+'/parent',{waitUntil:'domcontentloaded'}); assert(await page.evaluate(()=>document.documentElement.dataset.theme)==='dark','Theme lost cross-route');
  report.settings.nightPersistence='PASS';

  const tab2 = await context.newPage(); await tab2.goto(base+'/admin/settings',{waitUntil:'domcontentloaded'});
  await page.goto(base+'/admin/settings',{waitUntil:'domcontentloaded'}); await clickSetting('Day Mode'); await sleep(180);
  assert(await tab2.evaluate(()=>document.documentElement.dataset.theme)==='light','Cross-tab storage sync failed'); report.settings.crossTab='PASS';

  await page.emulateMedia({colorScheme:'dark'}); await clickSetting('System'); await sleep(80); assert(await page.evaluate(()=>document.documentElement.dataset.theme)==='dark','System dark failed');
  await page.emulateMedia({colorScheme:'light'}); await sleep(120); assert(await page.evaluate(()=>document.documentElement.dataset.theme)==='light','System live OS change failed'); report.settings.systemReaction='PASS';

  await clickSetting('Arabic First');
  const order = await page.locator('.bi').filter({has:page.locator('.bi-en')}).first().evaluate(el=>Array.from(el.children).filter(c=>c.classList.contains('bi-en')||c.classList.contains('bi-ar')).map(c=>c.classList.contains('bi-ar')?'ar':'en'));
  assert(order[0]==='ar'&&order.includes('en'),'Arabic-first DOM order failed'); report.settings.bilingualOrder=order.join('>');

  const card = page.locator('.setting-card').first(); const comfortablePadding=await card.evaluate(el=>parseFloat(getComputedStyle(el).paddingTop)); await clickSetting('Compact'); const compactPadding=await card.evaluate(el=>parseFloat(getComputedStyle(el).paddingTop)); assert(compactPadding<comfortablePadding,`Density did not visibly compact: ${comfortablePadding}/${compactPadding}`); report.settings.density={comfortablePadding,compactPadding};
  const sampleBi=page.locator('.setting-card .bi').first(); const defaultFont=await sampleBi.evaluate(el=>parseFloat(getComputedStyle(el).fontSize)); await clickSetting('Large'); const largeFont=await sampleBi.evaluate(el=>parseFloat(getComputedStyle(el).fontSize)); assert(largeFont>defaultFont,`Large text did not increase: ${defaultFont}/${largeFont}`); const dims=await page.evaluate(()=>({s:document.documentElement.scrollWidth,c:document.documentElement.clientWidth})); assert(dims.s<=dims.c+1,'Large text caused overflow'); report.settings.fontScale={defaultFont,largeFont};

  await clickSetting('Collapsed'); await page.reload({waitUntil:'domcontentloaded'}); assert(await page.locator('.admin-shell.sidebar-collapsed').count()===1,'Sidebar preference lost after reload'); report.settings.sidebar='PASS';
  await clickSetting('Reduce Motion'); stored=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)),KEY); assert(stored.motion==='reduced','Reduced motion not persisted');
  await page.evaluate(()=>sessionStorage.removeItem('uos:splash-seen')); const start=Date.now(); await page.goto(base+'/',{waitUntil:'domcontentloaded'}); const visible=await page.locator('.splash').isVisible().catch(()=>false); const elapsed=Date.now()-start; assert(!visible&&elapsed<=1000,`Local reduced splash still visible: ${visible}/${elapsed}`); report.settings.localReducedSplash={visible,elapsed};

  await page.goto(base+'/admin/settings',{waitUntil:'domcontentloaded'}); await page.getByRole('button',{name:/Reset Settings/i}).click(); assert(await page.getByRole('dialog').isVisible(),'Reset dialog not visible'); await page.keyboard.press('Escape'); assert(await page.getByRole('dialog').count()===0,'Dialog Escape failed'); await page.getByRole('button',{name:/Reset Settings/i}).click(); await page.getByRole('button',{name:/Reset Interface/i}).click(); await sleep(80); assert(await page.evaluate((key)=>localStorage.getItem(key),KEY)===null,'Reset did not clear versioned key'); report.settings.reset='PASS';
  await page.evaluate((key)=>localStorage.setItem(key,'{broken-json'),KEY); await page.reload({waitUntil:'domcontentloaded'}); assert(await page.evaluate(()=>document.documentElement.dataset.appearance)==='system','Corrupt settings did not recover'); report.settings.corruptStorage='PASS';

  await page.goto(base+'/admin',{waitUntil:'domcontentloaded'}); await page.setViewportSize({width:390,height:844}); const mobileMenu=page.getByRole('button',{name:/Open navigation/i}); if(await mobileMenu.count()){await mobileMenu.click(); assert(await page.locator('.admin-sidebar.is-open').count()===1,'Admin drawer did not open'); await page.keyboard.press('Escape'); assert(await page.locator('.admin-sidebar.is-open').count()===0,'Admin drawer Escape failed');} report.settings.drawerEscape='PASS';
  await context.close();

  const rmContext=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce',colorScheme:'dark'}); const rm=await rmContext.newPage(); await seed(rm,{...defaults,appearance:'dark'},false); const rmStart=Date.now(); await rm.goto(base+'/',{waitUntil:'domcontentloaded'}); await rm.locator('.splash').waitFor({state:'detached',timeout:1000}); const rmElapsed=Date.now()-rmStart; const decorations=await rm.locator('.splash-particles,.splash-shield-outline,.splash-energy-ring,.gold-orbit').count(); assert(decorations===0,`OS reduced motion decorations present: ${decorations}`); assert(rmElapsed<=1000,`OS reduced splash >1000ms: ${rmElapsed}`); await rm.goto(base+'/about',{waitUntil:'domcontentloaded'}); assert(await rm.locator('.splash').count()===0,'Splash replayed in same session'); report.settings.osReducedMotion={elapsed:rmElapsed,decorations,noReplay:true}; await rmContext.close();

  for(const appearance of ['light','dark']){
    for(const route of ['/','/admin','/parent']){
      const fc=await browser.newContext({viewport:{width:1366,height:768},colorScheme:appearance}); const fp=await fc.newPage();
      await fp.addInitScript(({key,settings})=>{localStorage.setItem(key,JSON.stringify(settings));sessionStorage.setItem('uos:splash-seen','1');window.__uosThemeSequence=[];const root=document.documentElement;const push=()=>{const value=root.dataset.theme;if(value)window.__uosThemeSequence.push(value)};new MutationObserver(push).observe(root,{attributes:true,attributeFilter:['data-theme']});push();},{key:KEY,settings:{...defaults,appearance}});
      await fp.goto(base+route,{waitUntil:'domcontentloaded'}); const seq=await fp.evaluate(()=>window.__uosThemeSequence||[]); assert(seq[0]===appearance,`FOUC theme sequence ${appearance}:${route}: ${seq}`); report.fouc[`${appearance}:${route}`]=seq; await fc.close();
    }
  }

  const tabContext=await browser.newContext({viewport:{width:1600,height:900}}); const tabs=await tabContext.newPage(); await seed(tabs,{...defaults,appearance:'dark'});
  await tabs.goto(base+'/admin/sports/football',{waitUntil:'domcontentloaded'}); const sportLabels=['Overview','Training Groups / Teams','Players','Coaches','Programs','Performance Metrics','Media']; for(const label of sportLabels){const b=tabs.getByRole('tab',{name:new RegExp(label,'i')});await b.click();assert(await b.getAttribute('aria-selected')==='true',`Sport tab failed ${label}`);} report.tabs.sport=sportLabels;
  await tabs.goto(base+'/admin/players/player-demo-001',{waitUntil:'domcontentloaded'}); const playerLabels=['Overview','Attendance','Performance','Coach Feedback','Achievements','Schedule','Documents']; for(const label of playerLabels){const b=tabs.getByRole('tab',{name:new RegExp(label,'i')});await b.click();assert(await b.getAttribute('aria-selected')==='true',`Player tab failed ${label}`);} report.tabs.player=playerLabels; await tabContext.close();

  for(const [width,height] of viewports){
    const vc=await browser.newContext({viewport:{width,height},colorScheme:'light'}); const vp=await vc.newPage(); await seed(vp,{...defaults,appearance:'light'}); for(const route of responsiveRoutes){await vp.goto(base+route,{waitUntil:'domcontentloaded'});const d=await vp.evaluate(()=>({s:document.documentElement.scrollWidth,c:document.documentElement.clientWidth}));assert(d.s<=d.c+1,`Responsive overflow ${route}@${width}x${height}: ${d.s}/${d.c}`);report.responsive[`${route}@${width}x${height}`]=d;} await vc.close();
  }

  assert(report.consoleErrors.length===0,`Console errors: ${report.consoleErrors.join(' || ')}`);
  report.status='PASS'; fs.mkdirSync('qa07r',{recursive:true}); fs.writeFileSync('qa07r/report.json',JSON.stringify(report,null,2)); console.log('MISSION_07R_REPORT='+JSON.stringify(report));
}catch(error){report.status='FAIL';report.error=String(error?.stack||error);fs.mkdirSync('qa07r',{recursive:true});fs.writeFileSync('qa07r/report.json',JSON.stringify(report,null,2));console.log('MISSION_07R_REPORT='+JSON.stringify(report));throw error}finally{await browser.close();}
