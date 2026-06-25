import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\LENOVO\\AppData\\Local\\Microsoft\\Edge\\User Data';

async function main() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'msedge',
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(120000);

  // ======== 第1步: 改为公开仓库 ========
  console.log('▶️ 打开仓库设置...');
  await page.goto('https://github.com/Venicexx/B/settings', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  }).catch(() => {});
  await page.waitForTimeout(5000);

  // 找 "Change visibility" 或 "Make public" 按钮
  console.log('🔍 查找公开设置...');
  const dangerZone = page.locator('text=Danger Zone');
  if (await dangerZone.isVisible({ timeout: 5000 }).catch(() => false)) {
    // 滚动到 Danger Zone
    await dangerZone.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // 点击 Change visibility 或 Make public
    const changeVis = page.locator('summary:has-text("Change visibility"), button:has-text("Change visibility"), button:has-text("Make public")');
    if (await changeVis.isVisible({ timeout: 3000 }).catch(() => false)) {
      await changeVis.click();
      await page.waitForTimeout(1000);

      // 确认 - 选择 "Make public"
      const makePublic = page.locator('button:has-text("Make public"), [role="menuitem"]:has-text("Make public"), button:has-text("I understand")');
      if (await makePublic.isVisible({ timeout: 3000 }).catch(() => false)) {
        await makePublic.click();
        await page.waitForTimeout(2000);
        console.log('✅ 仓库已改为公开！');

        // 可能需要再次确认
        const confirmBtn = page.locator('button:has-text("I understand"), button:has-text("Make public"), button:has-text("Confirm")');
        if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
          console.log('✅ 已确认！');
        }
      } else {
        console.log('⚠️ 未找到 Make public 按钮');
      }
    } else {
      console.log('⚠️ 未找到 Change visibility 按钮');
    }
  } else {
    console.log('⚠️ 未找到 Danger Zone');
    // 试试另一种方式：直接打开 visibility 设置
    console.log('尝试备用方案...');
  }

  // ======== 第2步: 启用 Pages ========
  console.log('\n▶️ 打开 Pages 设置...');
  await page.goto('https://github.com/Venicexx/B/settings/pages', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  }).catch(() => {});
  await page.waitForTimeout(5000);

  // 检查是否已改为公开
  const pageText = await page.locator('body').textContent().catch(() => '');
  if (pageText.includes('make this repository public')) {
    console.log('⚠️ 仍然显示需要公开仓库');
  } else {
    console.log('✅ 仓库已公开，可以配置 Pages！');
  }

  // 找 Source / Branch 设置
  console.log('🔍 查找 Pages 配置...');

  // 尝试找到 "Deploy from a branch" 选项
  const deployOptions = ['summary:has-text("Deploy")', 'text=Deploy from a branch', 'input[value="deploy_from_branch"]', 'radio[name="source"]'];
  for (const sel of deployOptions) {
    const el = page.locator(sel);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click().catch(() => {});
      await page.waitForTimeout(500);
    }
  }

  // 选择分支
  const branchSel = page.locator('select[name="branch"], #branch-select');
  if (await branchSel.isVisible({ timeout: 3000 }).catch(() => false)) {
    await branchSel.selectOption('master');
    await page.waitForTimeout(500);
    console.log('✅ 已选择 master 分支');
  }

  // 点击 Save
  const saveBtn = page.locator('button:has-text("Save")');
  if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(3000);
    console.log('✅ 已点击 Save！');
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'E:\\Claude Code(cursor)\\scripts\\pages-final.png' }).catch(() => {});

  console.log('\n🌐 GitHub Pages 地址:');
  console.log('   https://venicexx.github.io/B/snake.html');
  console.log('\n⏳ 部署可能需要 1-5 分钟');
  console.log('\n按 Ctrl+C 关闭浏览器');
}

main().catch(console.error);
