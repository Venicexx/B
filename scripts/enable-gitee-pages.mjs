import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\LENOVO\\AppData\\Local\\Microsoft\\Edge\\User Data';

async function main() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'msedge',
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();

  console.log('▶️ 打开 Gitee Pages 设置...');
  try {
    await page.goto('https://gitee.com/xuxwf-xu-xiongwei/xu-xiongwei/pages', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
  } catch (e) {
    console.log('⚠️ 加载超时，继续尝试...');
  }
  await page.waitForTimeout(5000);

  // 检查登录状态
  const bodyText = await page.locator('body').textContent().catch(() => '');
  const needLogin = bodyText.includes('登录') || bodyText.includes('Sign in');
  console.log('🔑 登录状态:', needLogin ? '需要登录' : '可能已登录');

  if (needLogin) {
    console.log('⏳ 请在浏览器中登录 Gitee...');
    for (let i = 0; i < 120; i++) {
      await page.waitForTimeout(3000);
      const current = await page.locator('body').textContent().catch(() => '');
      if (current.includes('Pages') || (!current.includes('登录') && current.length > 300)) {
        console.log('✅ 登录成功！');
        await page.waitForTimeout(3000);
        break;
      }
    }
  }

  // 去 Pages 设置页面
  await page.goto('https://gitee.com/xuxwf-xu-xiongwei/xu-xiongwei/pages', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  }).catch(() => {});
  await page.waitForTimeout(3000);

  console.log('🔍 查找 Pages 设置...');

  try {
    // 尝试选择分支 - Gitee Pages 的下拉框
    const branchSelect = page.locator('select:visible, .select:visible, [class*="branch"] select, [data-v*="branch"] select');
    if (await branchSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      await branchSelect.selectOption('snake-game');
      console.log('✅ 已选择 snake-game 分支');
      await page.waitForTimeout(1000);
    }

    // 勾选 "强制使用 HTTPS" 之类的选项
    // ...

    // 点击部署按钮
    const deployBtn = page.locator('button:has-text("部署"), button:has-text("启动"), input[value="部署"], input[value="启动"]');
    if (await deployBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await deployBtn.click();
      console.log('✅ 已点击部署！');
    }

    // 另一种按钮样式
    const submitBtn = page.locator('[type="submit"]:has-text("部署"), .ui.button:has-text("部署")');
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitBtn.click();
      console.log('✅ 已点击部署按钮！');
    }

    await page.waitForTimeout(5000);
    console.log('✅ Gitee Pages 部署请求已发送！');

  } catch (e) {
    console.log('❌ 自动操作出错:', e.message);
    console.log('📋 页面已打开，请在浏览器中手动操作。');
  }

  console.log('\n🌐 部署后游戏将在以下地址访问:');
  console.log('   https://xuxwf-xu-xiongwei.gitee.io/xu-xiongwei/snake.html');
  console.log('\n⏳ Gitee Pages 部署通常需要 1-5 分钟');
  console.log('   （如果页面显示了部署按钮，请手动点击部署）');
  console.log('\n按 Ctrl+C 关闭浏览器');
}

main().catch(console.error);
