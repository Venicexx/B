import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\LENOVO\\AppData\\Local\\Microsoft\\Edge\\User Data';

async function main() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'msedge',
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(120000);

  console.log('▶️ 打开仓库 General 设置...');
  await page.goto('https://github.com/Venicexx/B/settings', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  }).catch(() => {});
  await page.waitForTimeout(8000);

  // 滚动到 Danger Zone
  const dangerZone = page.locator('h2#danger-zone');
  await dangerZone.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // 点击 "Change visibility" 按钮
  console.log('🔍 点击 Change visibility...');
  const changeVisBtn = page.locator('span.Button-label').filter({ hasText: 'Change visibility' });
  if (await changeVisBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await changeVisBtn.click();
    console.log('✅ 已点击 Change visibility');
    await page.waitForTimeout(2000);
  } else {
    console.log('⚠️ 没找到 Change visibility 按钮，试试方法2');
    // 方法2：直接找按钮
    const btn2 = page.locator('button:has-text("Change visibility")');
    if (await btn2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn2.click();
      await page.waitForTimeout(2000);
    }
  }

  // 从下拉菜单中选择 "Change to public"
  console.log('🔍 选择 Change to public...');
  const changeToPublic = page.locator('span.ActionListItem-label').filter({ hasText: 'Change to public' });
  if (await changeToPublic.isVisible({ timeout: 5000 }).catch(() => false)) {
    await changeToPublic.click();
    console.log('✅ 已选择 Change to public');
    await page.waitForTimeout(2000);
  } else {
    // 同一个 span 看看能不能在 menu 中找到
    const menuItem = page.locator('[role="menuitem"]:has-text("Change to public"), button:has-text("Change to public")');
    if (await menuItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await menuItem.click();
      await page.waitForTimeout(2000);
      console.log('✅ 已选择 Change to public (方法2)');
    } else {
      console.log('⚠️ 没找到 Change to public 选项');
    }
  }

  // 确认弹窗 - "I want to make this repository public"
  console.log('🔍 确认公开...');
  const confirmPublic = page.locator('span.Button-label').filter({ hasText: 'I want to make this repository public' });
  if (await confirmPublic.isVisible({ timeout: 5000 }).catch(() => false)) {
    await confirmPublic.click();
    console.log('✅ 已确认公开！');
    await page.waitForTimeout(3000);
  } else {
    const confirmBtn = page.locator('button:has-text("I want to make this repository public"), button:has-text("I understand")');
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
      await page.waitForTimeout(3000);
      console.log('✅ 已确认公开！');
    }
  }

  // 检查是否需要填密码
  const pwdField = page.locator('input[type="password"]');
  if (await pwdField.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('🔑 需要输入 GitHub 密码确认');
    console.log('   请在浏览器中填写密码');
    // 等待用户填写密码
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(3000);
      const stillVisible = await pwdField.isVisible().catch(() => false);
      if (!stillVisible) {
        console.log('✅ 密码已确认！');
        break;
      }
    }
    await page.waitForTimeout(3000);
  }

  // 现在去 Pages 设置
  console.log('\n▶️ 打开 Pages 设置...');
  await page.goto('https://github.com/Venicexx/B/settings/pages', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  }).catch(() => {});
  await page.waitForTimeout(5000);

  const bodyText = await page.locator('body').textContent().catch(() => '');
  if (bodyText.includes('make this repository public')) {
    console.log('❌ 仍然显示需要公开仓库，可能需要手动操作');
  } else {
    console.log('✅ 仓库已公开！开始配置 Pages...');

    // 找 Deploy from a branch 选项 (GitHub 的新 UI)
    const deployRadio = page.locator('input[type="radio"][name="source"][value="deploy_from_branch"]');
    if (await deployRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
      await deployRadio.click();
      await page.waitForTimeout(1000);
      console.log('✅ 已选择 Deploy from a branch');
    }

    // 找 branch 下拉
    const branchSelect = page.locator('select[name="branch"]');
    if (await branchSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await branchSelect.selectOption('master');
      await page.waitForTimeout(500);
      console.log('✅ 已选择 master');
    }

    // 点击 Save
    const saveBtn = page.locator('button:has-text("Save")');
    if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      console.log('✅ 已点击 Save！');
    }
  }

  await page.screenshot({ path: 'E:\\Claude Code(cursor)\\scripts\\result.png' }).catch(() => {});

  console.log('\n🌐 游戏上线地址:');
  console.log('   https://venicexx.github.io/B/snake.html');
  console.log('\n⏳ 等待 1-5 分钟后访问');
  console.log('\n按 Ctrl+C 关闭浏览器');
}

main().catch(console.error);
