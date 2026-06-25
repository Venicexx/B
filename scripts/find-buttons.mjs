import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\LENOVO\\AppData\\Local\\Microsoft\\Edge\\User Data';

async function main() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'msedge',
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(120000);

  // 直接到仓库 General 设置页面
  console.log('▶️ 打开仓库 General 设置...');
  await page.goto('https://github.com/Venicexx/B/settings', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  }).catch(() => {});
  await page.waitForTimeout(8000);

  // 找到所有可能跟 visibility / danger 相关的元素
  const info = await page.evaluate(() => {
    // 查找包含 danger / visibility / public / private 的文本元素
    const all = document.body.querySelectorAll('*');
    const results = [];
    for (const el of all) {
      if (!el.children || el.children.length > 0) continue;
      const text = el.textContent?.trim() || '';
      if (!text || text.length > 200) continue;
      const lower = text.toLowerCase();
      if (lower.includes('danger') || lower.includes('visibility') || lower.includes('make public') ||
          lower.includes('change') || lower.includes('private') || lower.includes('public')) {
        results.push({
          tag: el.tagName,
          text: text.substring(0, 120),
          id: el.id || '',
          class: (el.className || '').substring(0, 80),
          parentTag: el.parentElement?.tagName || '',
          grandParentTag: el.parentElement?.parentElement?.tagName || '',
        });
      }
    }
    return results;
  });

  console.log('\n=== 匹配元素 ===');
  for (const r of info) {
    console.log(`[${r.tag}] "${r.text}" id="${r.id}" class="${r.class}" parent=${r.parentTag}`);
  }

  // 找所有 summary 元素（下拉按钮）
  const summaries = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('summary')).map(s => ({
      text: s.textContent?.trim()?.substring(0, 100) || '',
      'aria-label': s.getAttribute('aria-label') || '',
      id: s.id || '',
      class: (s.className || '').substring(0, 60),
    }));
  });

  console.log('\n=== summary 元素 ===');
  for (const s of summaries) {
    console.log(`  "${s.text}" aria-label="${s['aria-label']}" class="${s.class}"`);
  }

  // 找所有 h2/h3 标题
  const headings = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h2, h3, h4')).map(h => ({
      tag: h.tagName,
      text: h.textContent?.trim() || '',
    }));
  });

  console.log('\n=== 标题 ===');
  for (const h of headings) {
    console.log(`  [${h.tag}] "${h.text}"`);
  }

  await page.screenshot({ path: 'E:\\Claude Code(cursor)\\scripts\\settings-page.png', fullPage: true });
  console.log('\n📸 截图已保存');
  console.log('页面已打开，请查看浏览器窗口');
}

main().catch(console.error);
