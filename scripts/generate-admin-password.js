#!/usr/bin/env node

/**
 * 管理員密碼雜湊生成工具
 *
 * 用途：為 admin-auth.js 生成 SHA-256 密碼雜湊值
 * 使用：node generate-admin-password.js [password]
 */

const crypto = require('crypto');
const readline = require('readline');

/**
 * 生成 SHA-256 雜湊
 */
function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * 從命令列參數獲取密碼
 */
async function getPasswordFromArgs() {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    return args[0];
  }
  return null;
}

/**
 * 從互動式輸入獲取密碼
 */
async function getPasswordFromPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('請輸入管理員密碼: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

/**
 * 主函數
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SkiDIY FAQ - 管理員密碼雜湊生成器');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 獲取密碼
  let password = await getPasswordFromArgs();

  if (!password) {
    password = await getPasswordFromPrompt();
  }

  if (!password || password.trim() === '') {
    console.error('❌ 錯誤：密碼不能為空');
    process.exit(1);
  }

  password = password.trim();

  // 密碼強度檢查
  const strength = {
    length: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password)
  };

  const strengthScore = Object.values(strength).filter(Boolean).length;

  console.log('\n密碼強度分析:');
  console.log(`  長度 >= 8: ${strength.length ? '✓' : '✗'}`);
  console.log(`  包含小寫: ${strength.hasLower ? '✓' : '✗'}`);
  console.log(`  包含大寫: ${strength.hasUpper ? '✓' : '✗'}`);
  console.log(`  包含數字: ${strength.hasNumber ? '✓' : '✗'}`);
  console.log(`  包含特殊字元: ${strength.hasSpecial ? '✓' : '✗'}`);

  if (strengthScore < 3) {
    console.log('\n⚠️  警告：密碼強度較弱，建議包含大小寫字母、數字和特殊字元');
  } else if (strengthScore < 5) {
    console.log('\n✓ 密碼強度：中等');
  } else {
    console.log('\n✓✓ 密碼強度：強');
  }

  // 生成雜湊
  const hash = sha256(password);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('生成的 SHA-256 雜湊值：');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`  ${hash}\n`);

  console.log('使用說明：');
  console.log('1. 複製上方的雜湊值');
  console.log('2. 打開 frontend/assets/admin-auth.js');
  console.log('3. 找到 PASSWORD_HASH 配置項');
  console.log('4. 將雜湊值替換為上方的值');
  console.log('5. 儲存檔案並重新部署\n');

  console.log('範例配置：');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('const CONFIG = {');
  console.log(`  PASSWORD_HASH: '${hash}',`);
  console.log('  ...');
  console.log('};');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('⚠️  安全提醒：');
  console.log('  - 請勿將明文密碼儲存在程式碼中');
  console.log('  - 定期更換管理員密碼（建議 3-6 個月）');
  console.log('  - 使用密碼管理器儲存密碼');
  console.log('  - 不要在 Git repository 中提交密碼\n');
}

// 執行主函數
main().catch((error) => {
  console.error('❌ 錯誤:', error.message);
  process.exit(1);
});
