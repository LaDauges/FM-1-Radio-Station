// temps entre le PLAY de la machine et la première piste allumée, simulateur à vitesse réelle (écritures à 90 ms)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/app/index.html?sim=1'); await p.waitForTimeout(500);
  await p.click('#connect'); await p.waitForFunction(() => !document.getElementById('play').disabled, null, { timeout: 60000 });
  await p.click('#play'); await p.waitForFunction(() => /PLAY on your/.test(document.getElementById('status').textContent), null, { timeout: 20000 });
  await p.waitForTimeout(Number(process.argv[2] || 0));
  const t0 = Date.now(); await p.evaluate(() => window.__simPlay());
  await p.waitForFunction(() => [...document.querySelectorAll('#lanes .lane')].some(l => l.classList.contains('on')), null, { timeout: 60000 });
  const first = Date.now() - t0;
  const heads = []; await p.waitForTimeout(9000); for (let i = 0; i < 6; i++) { heads.push(await p.evaluate(() => Number(document.getElementById('arcHead').getAttribute('x1')).toFixed(2))); await p.waitForTimeout(500); }
  const log = await p.evaluate(() => document.getElementById('log').textContent.split('\n').filter(l => /ERROR|BLOCK/.test(l)));
  console.log('attente avant PLAY', process.argv[2] || 0, 'ms ; première piste allumée', first, 'ms après PLAY ; tête de lecture', heads.join(' '), log, errs);
  await b.close();
})();
