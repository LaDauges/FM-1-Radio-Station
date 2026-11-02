const { chromium } = require('playwright');
const file = process.argv[2], out = process.argv[3] || '.';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const R = {};
  await p.goto((file.startsWith('http') ? file : 'file://' + file) + '?sim=1&fast=1'); await p.waitForTimeout(500);
  R.lang0 = await p.evaluate(() => [document.documentElement.lang, document.querySelector('[data-t=plugTitle]').textContent, document.getElementById('pillText').textContent]);
  await p.screenshot({ path: out + '/s1-plug.png' });
  await p.click('#connect');
  await p.waitForFunction(() => /JIANT V10/.test(document.getElementById('conn').textContent), null, { timeout: 30000 });
  await p.waitForTimeout(800);
  R.checks = await p.evaluate(() => [...document.querySelectorAll('.check')].map(c => c.className + ' | ' + c.textContent.trim().replace(/\s+/g, ' ')));
  R.playEnabled = await p.evaluate(() => !document.getElementById('play').disabled);
  // horloge absente
  await p.evaluate(() => { window.__sim.g[2] = 1; }); await p.waitForTimeout(1800);
  R.noClock = await p.evaluate(() => [document.querySelectorAll('.check')[2].className, document.getElementById('play').disabled, document.getElementById('listen').textContent]);
  await p.screenshot({ path: out + '/s2-noclock.png' });
  await p.evaluate(() => { window.__sim.g[2] = 0; }); await p.waitForTimeout(1500);
  // FR
  await p.click('#langs button[data-lang=fr]'); await p.waitForTimeout(200);
  R.fr = await p.evaluate(() => [document.documentElement.lang, document.querySelector('[data-t=plugTitle]').textContent, document.getElementById('play').textContent, document.querySelectorAll('.check')[2].textContent.trim().replace(/\s+/g, ' ')]);
  R.deDisabled = await p.evaluate(() => document.querySelector('#langs button[data-lang=de]').disabled);
  await p.click('#langs button[data-lang=en]');
  const before = await p.evaluate(() => JSON.stringify(window.__sim.trk));
  await p.click('#idxPlug button[data-genre="DETROIT"]'); R.playLabel = await p.evaluate(() => document.getElementById('play').textContent); await p.click('details summary'); await p.selectOption('#dur', '3'); await p.click('#play');
  await p.waitForFunction(() => /PLAY on your/.test(document.getElementById('status').textContent), null, { timeout: 20000 });
  R.pillWait = await p.evaluate(() => document.getElementById('pillText').textContent);
  await p.evaluate(() => window.__simPlay());
  await p.waitForFunction(() => /intro/.test(document.getElementById('status').textContent), null, { timeout: 60000 });
  R.pillOn = await p.evaluate(() => document.getElementById('pillText').textContent);
  await p.waitForTimeout(4000);
  const t1 = await p.evaluate(() => document.getElementById('title').textContent);
  R.air = await p.evaluate(() => ({ title: document.getElementById('title').textContent, seed: document.getElementById('seed').textContent, meta: document.getElementById('meta').textContent,
    phases: document.getElementById('phases').textContent, arc: document.getElementById('arcAll').getAttribute('d').length, lanes: document.getElementById('lanes').textContent.replace(/\s+/g, ' '),
    sched: document.getElementById('sched').textContent.replace(/\s+/g, ' ') }));
  await p.screenshot({ path: out + '/s3-air.png' });
  R.laneStates = [];
  for (let i = 0; i < 12; i++) { R.laneStates.push(await p.evaluate(() => [...document.querySelectorAll('#lanes .lane')].map(l => l.className.replace('lane ', '') + ':' + l.textContent.trim().replace(/\s+/g, ' ')).join(' | '))); await p.waitForTimeout(250); }
  R.laneStates = [...new Set(R.laneStates)].slice(0, 6);
  await p.click('#themeBtn'); await p.waitForTimeout(400);
  R.theme = await p.evaluate(() => [document.documentElement.dataset.theme, getComputedStyle(document.body).backgroundColor, document.getElementById('themeBtn').getAttribute('aria-label')]);
  await p.screenshot({ path: out + '/s3b-signal.png' });
  await p.click('#idxAir button[data-genre="DUB TECHNO"]'); await p.waitForTimeout(300);
  R.queued = await p.evaluate(() => [document.getElementById('status').textContent, document.querySelector('#idxAir button.q') && document.querySelector('#idxAir button.q').textContent]);
  await p.click('#idxAir button[data-genre="DUB TECHNO"]'); await p.waitForTimeout(300);
  R.unqueued = await p.evaluate(() => [document.getElementById('status').textContent, !!document.querySelector('#idxAir button.q')]);
  await p.click('#themeBtn'); await p.waitForTimeout(200);
  await p.click('#idxAir button[data-genre="DUB TECHNO"]'); await p.waitForTimeout(200);
  // l'utilisateur joue
  const keep = setInterval(() => p.evaluate(() => { window.__simKey(); window.__simTouch(); }).catch(() => {}), 700);
  await p.waitForTimeout(3000);
  R.banner = await p.evaluate(() => [!document.getElementById('banner').classList.contains('hidden'), document.getElementById('bannerTitle').textContent]);
  await p.screenshot({ path: out + '/s4-playing.png' });
  await p.waitForTimeout(6000);
  R.held = await p.evaluate(() => document.getElementById('title').textContent);
  clearInterval(keep);
  // transition : titre ANCIEN → NOUVEAU
  await p.waitForFunction(() => document.querySelector('#title .new'), null, { timeout: 120000 });
  R.trans = await p.evaluate(() => document.getElementById('title').textContent); R.transIdx = await p.evaluate(() => [...document.querySelectorAll('#idxAir button.on, #idxAir button.q')].map(b => b.className + ':' + b.textContent));
  await p.screenshot({ path: out + '/s5-transition.png' });
  await p.waitForFunction(() => !document.querySelector('#title .new'), null, { timeout: 120000 });
  R.t2 = await p.evaluate(() => document.getElementById('title').textContent);
  // FR à l'antenne
  await p.click('#langs button[data-lang=fr]'); await p.waitForTimeout(300);
  R.frAir = await p.evaluate(() => [document.getElementById('status').textContent, document.getElementById('meta').textContent, document.getElementById('next').textContent, document.getElementById('phases').textContent]);
  await p.click('#fav'); await p.waitForTimeout(200);
  R.favs = await p.evaluate(() => document.getElementById('favs').textContent.replace(/\s+/g, ' '));
  await p.click('#langs button[data-lang=en]');
  // mobile
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(300);
  R.mobileScroll = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  await p.screenshot({ path: out + '/s6-mobile.png', fullPage: true });
  await p.setViewportSize({ width: 1280, height: 860 });
  // arrêt et retour de la musique
  await p.click('#stop'); await p.waitForTimeout(500);
  await p.evaluate(() => window.__simStop());
  R.afterStop = await p.evaluate(() => [document.getElementById('viewPlug').classList.contains('hidden'), document.getElementById('plugStatus').textContent, document.getElementById('pillText').textContent]);
  await p.click('#restoreMine');
  await p.waitForFunction(() => /is back/.test(document.getElementById('plugStatus').textContent), null, { timeout: 120000 });
  const norm = s => JSON.stringify(JSON.parse(s).map(t => ({ ...t, p: t.p.map((v, i) => i === 40 ? 0 : v) })));
  const after = await p.evaluate(() => JSON.stringify(window.__sim.trk));
  R.restoredIdentical = norm(before) === norm(after);
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(200);
  R.mobilePlugScroll = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  await p.screenshot({ path: out + '/s7-mobile-plug.png', fullPage: true });
  const log = await p.evaluate(() => document.getElementById('log').textContent.split('\n'));
  R.block = log.filter(l => /BLOCK|ERROR/.test(l));
  R.cmds = await p.evaluate(() => { const c = {}; for (const d of window.__simSent) { const k = d[0] === 0xF0 ? d[4] : d[0]; c[k] = (c[k] || 0) + 1; } return c; });
  R.errs = errs;
  console.log(JSON.stringify(R, null, 1));
  await b.close();
})();
