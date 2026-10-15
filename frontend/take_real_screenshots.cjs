const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const outDir = 'C:\\Users\\Shanth gouda\\.gemini\\antigravity-ide\\brain\\d37196e4-b75a-4bd9-8124-83f9f06347ab';
  const learnaiDir = 'C:\\Users\\Shanth gouda\\.gemini\antigravity-ide\\scratch\\learnai';

  async function snap(name) {
    await page.waitForTimeout(400);
    const dest = path.join(outDir, name);
    await page.screenshot({ path: dest });
    const destLearnAI = path.join(learnaiDir, name);
    try { fs.copyFileSync(dest, destLearnAI); } catch(e){}
    console.log(`Saved screenshot: ${name}`);
  }

  console.log('Navigating to portal...');
  await page.goto('http://localhost:7890/learnai_portal.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // 1. Faculty Login
  console.log('1. Authenticating as Faculty...');
  await page.evaluate(() => window.doLogin());
  await snap('teacher_telemetry_desk.png');

  // 2. Teacher Course View: Python
  console.log('2. Opening Teacher Python Course...');
  await page.evaluate(() => window.switchClassCohort('py'));
  await snap('teacher_course_python.png');

  // 3. Teacher Course View: Java
  console.log('3. Opening Teacher Java Course...');
  await page.evaluate(() => window.switchClassCohort('java'));
  await snap('teacher_course_java.png');

  // 4. Teacher Course View: C Systems
  console.log('4. Opening Teacher C Systems Course...');
  await page.evaluate(() => window.switchClassCohort('cprog'));
  await snap('teacher_course_cprog.png');

  // 5. Logout and Switch to Student
  console.log('5. Switching to Student Workspace...');
  await page.evaluate(() => {
    window.doLogout();
    window.switchRole('student');
    window.doLogin();
  });
  await snap('student_code_tracer.png');

  // 6. Student Course Hub: Python
  console.log('6. Opening Student Python Course...');
  await page.evaluate(() => window.openStudentCourse('py'));
  await snap('student_course_python.png');

  // 7. Student Course Hub: Java
  console.log('7. Opening Student Java Course...');
  await page.evaluate(() => window.openStudentCourse('java'));
  await snap('student_course_java.png');

  // 8. Student Course Hub: C Systems
  console.log('8. Opening Student C Systems Course...');
  await page.evaluate(() => window.openStudentCourse('cprog'));
  await snap('student_course_cprog.png');

  // 9. Student Inbuilt Word Doc Assignment Editor
  console.log('9. Opening Student Assignment Editor...');
  await page.evaluate(() => window.selectStudentView('myAssign'));
  await snap('student_assignment_editor.png');

  await browser.close();
  console.log('SUCCESS: All 9 screenshots captured perfectly!');
}

run().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
