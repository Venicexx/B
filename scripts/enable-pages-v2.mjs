import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\LENOVO\\AppData\\Local\\Microsoft\\Edge\\User Data';

async function main() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'msedge',
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(120000);

  console.log('▶️ 打开 GitHub Pages 设置...');
  await page.goto('https://github.com/Venicexx/B/settings/pages', {
    waitUntil: 'networkidle',
    timeout: 120000,
  }).catch(() => console.log('⚠️ 超时，继续操作'));
  await page.waitForTimeout(5000);

  // 探索页面上的所有按钮和关键元素
  const elements = await page.evaluate(() => {
    // 查找所有按钮
    const allButtons = Array.from(document.querySelectorAll('button, summary, a.btn, [role="button"], input[type="submit"], input[type="radio"]'));
    const btnInfo = allButtons.map(el => ({
      tag: el.tagName,
      type: el.getAttribute('type') || '',
      text: el.textContent?.trim()?.substring(0, 80) || '',
      id: el.id || '',
      class: el.className?.substring(0, 60) || '',
      'aria-label': el.getAttribute('aria-label') || '',
      visible: el.offsetParent !== null,
      value: el.getAttribute('value') || '',
      name: el.getAttribute('name') || '',
    }));

    // 查找所有选择框
    const allSelects = Array.from(document.querySelectorAll('select'));
    const selectInfo = allSelects.map(el => ({
      id: el.id,
      name: el.getAttribute('name') || '',
      options: Array.from(el.options).map(o => o.value),
    }));

    // 查找所有含有 "branch" 或 "deploy" 或 "source" 的元素
    const allDivs = Array.from(document.querySelectorAll('div, label, span, h2, h3'));
    const keyInfo = allDivs
      .filter(el => {
        const t = el.textContent?.toLowerCase() || '';
        return t.includes('branch') || t.includes('deploy') || t.includes('source') || t.includes('pages');
      })
      .map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim()?.substring(0, 100) || '',
        id: el.id || '',
        class: el.className?.substring(0, 60) || '',
      }));

    return { buttons: btnInfo, selects: selectInfo, labels: keyInfo };
  });

  console.log('\n=== 页面元素分析 ===');
  console.log('\n📋 关键标签/文本:');
  for (const l of elements.labels.slice(0, 20)) {
    console.log(`  [${l.tag}] ${l.text.substring(0, 80)}`);
  }

  console.log('\n📋 按钮列表:');
  for (const b of elements.buttons.slice(0, 30)) {
    if (b.visible) console.log(`  [${b.tag}:${b.type}] "${b.text}" id="${b.id}" name="${b.name}"`);
  }

  console.log('\n📋 选择框:');
  for (const s of elements.selects) {
    console.log(`  id="${s.id}" name="${s.name}" options=${JSON.stringify(s.options)}`);
  }

  // 保存截图
  await page.screenshot({ path: 'E:\\Claude Code(cursor)\\scripts\\github-pages.png', fullPage: true });
  console.log('\n📸 截图已保存到 scripts/github-pages.png');

  console.log('\n浏览器窗口已打开，你可以看到 GitHub Pages 设置页面。');
  console.log('按 Ctrl+C 关闭浏览器');
}

main().catch(console.error);
