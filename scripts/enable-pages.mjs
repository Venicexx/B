import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\LENOVO\\AppData\\Local\\Microsoft\\Edge\\User Data';

async function main() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'msedge',
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(120000);

  console.log('▶️ 打开 GitHub Pages 设置...');
  await page.goto('https://github.com/Venicexx/B/settings/pages', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  }).catch(() => console.log('⚠️ 加载超时，继续...'));
  await page.waitForTimeout(8000);

  // 检查页面状态
  const bodyText = await page.locator('body').textContent().catch(() => '');
  console.log('📄 页面已加载，长度:', bodyText.length);

  // 检查是否需要登录
  if (bodyText.includes('Sign in') && bodyText.length < 500) {
    console.log('🔑 需要登录，请在浏览器中登录 GitHub...');
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(3000);
      const current = await page.locator('body').textContent().catch(() => '');
      if (current.length > 800 && !current.includes('Sign in')) {
        console.log('✅ 登录成功！');
        break;
      }
    }
  }

  // 保存截图以便调试
  await page.screenshot({ path: 'E:\\Claude Code(cursor)\\scripts\\pages-before.png' }).catch(() => {});
  console.log('📸 已保存操作前截图');

  // GitHub Pages 设置页面 - 找到 Source 部分
  // 页面有两种可能的 UI

  async function findAndClick() {
    const selectors = [
      // 方案1: 新的 GitHub UI - "Deploy from a branch" 的 radio/button
      { type: 'radio', selector: 'input[type="radio"][name="source"][value="deploy_from_branch"]' },
      // 方案2: 旧的 GitHub UI - source 下拉
      { type: 'select', selector: '#source-select, select[name="source"]' },
      // 方案3: 包含 "Deploy from a branch" 的 label
      { type: 'label', selector: 'text=Deploy from a branch' },
      // 方案4: 任何包含 "Deploy from" 文字的可点击元素
      { type: 'click', selector: 'summary:has-text("Deploy")' },
      // 方案5: 包含 "Branch" 的 summary/dropdown
      { type: 'click', selector: 'summary:has-text("Branch")' },
    ];

    for (const s of selectors) {
      const el = page.locator(s.selector);
      if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`🔍 找到元素: ${s.type} - ${s.selector}`);
        await el.click().catch(() => {});
        await page.waitForTimeout(1000);
      }
    }

    // 尝试选择 master 分支
    const branchOpts = [
      'select[name="branch"]',
      '#branch-select',
      '[data-testid="branch-select"]',
      'text=master',
      'li:has-text("master")',
    ];
    for (const sel of branchOpts) {
      const el = page.locator(sel);
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log(`🔍 选择分支: ${sel}`);
        await el.click().catch(() => {});
        await page.waitForTimeout(500);
        // 如果是 select 元素，用 selectOption
        if (sel.includes('select')) {
          await el.selectOption('master').catch(() => {});
        }
        break;
      }
    }

    // 尝试点击 Save
    const saveBtns = [
      'button:has-text("Save")',
      'input[type="submit"][value="Save"]',
      '[type="submit"]',
    ];
    for (const sel of saveBtns) {
      const el = page.locator(sel);
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log(`💾 点击 Save: ${sel}`);
        await el.click().catch(() => {});
        await page.waitForTimeout(2000);
        break;
      }
    }
  }

  await findAndClick();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'E:\\Claude Code(cursor)\\scripts\\pages-after.png' }).catch(() => {});
  console.log('📸 已保存操作后截图');

  // 检查结果
  const afterText = await page.locator('body').textContent().catch(() => '');
  if (afterText.includes('Your site is published') || afterText.includes('Your site is ready')) {
    console.log('✅✅✅ GITHUB PAGES 已成功启用！');
  } else if (afterText.includes('Deploy from a branch')) {
    console.log('⚠️ 页面显示了 Pages 设置，可能需要手动确认');
  } else {
    console.log('📋 请检查浏览器页面，可能需要手动点击 Save');
  }

  console.log('\n🌐 GitHub Pages 上线地址:');
  console.log('   https://venicexx.github.io/B/snake.html');
  console.log('\n⏳ 首次部署可能需要 1-5 分钟');
  console.log('\n按 Ctrl+C 关闭浏览器');
}

main().catch(console.error);
