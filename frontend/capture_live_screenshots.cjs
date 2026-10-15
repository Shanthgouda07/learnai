const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  const outDirBrain = 'C:\\Users\\Shanth gouda\\.gemini\\antigravity-ide\\brain\\d37196e4-b75a-4bd9-8124-83f9f06347ab';
  const outDirLearnAI = 'C:\\Users\\Shanth gouda\\.gemini\\antigravity-ide\\scratch\\learnai';

  const targets = [
    { name: 'teacher_telemetry_desk.png', hash: 'teacher-desk' },
    { name: 'teacher_course_python.png', hash: 'teacher-courses-py' },
    { name: 'teacher_course_java.png', hash: 'teacher-courses-java' },
    { name: 'teacher_course_cprog.png', hash: 'teacher-courses-cprog' },
    { name: 'student_code_tracer.png', hash: 'student-lab' },
    { name: 'student_course_python.png', hash: 'student-courses-py' },
    { name: 'student_course_java.png', hash: 'student-courses-java' },
    { name: 'student_course_cprog.png', hash: 'student-courses-cprog' },
    { name: 'student_assignment_editor.png', hash: 'student-assign' }
  ];

  for (const t of targets) {
    const url = `http://localhost:7890/learnai_portal.html#${t.hash}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const destBrain = path.join(outDirBrain, t.name);
    const destLearnAI = path.join(outDirLearnAI, t.name);

    await page.screenshot({ path: destBrain });
    fs.copyFileSync(destBrain, destLearnAI);
    console.log(`Saved screenshot: ${t.name}`);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
