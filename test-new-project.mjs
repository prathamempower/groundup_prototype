import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to app...');
    // We assume Vite is running on localhost:3001
    await page.goto('http://localhost:3001/portfolio', { timeout: 10000 });
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Check if on login page
    const loginText = await page.$('text="Sign in to GroundUp AI"');
    if (loginText) {
      console.log('Logging in as Developer / Owner...');
      await page.click('text="Developer / Owner"');
      await page.waitForLoadState('networkidle');
    }
    
    // We might have an onboarding screen to clear first
    const onboarding = await page.$('text=Welcome to GroundUp AI');
    if (onboarding) {
       console.log('Skipping onboarding...');
       await page.evaluate(() => {
         localStorage.setItem('hasCompletedOnboarding', 'true');
       });
       await page.reload();
       await page.waitForLoadState('networkidle');
    }
    
    console.log('Clicking New Project button...');
    await page.click('button:has-text("New Project")');
    
    console.log('Checking if Welcome screen appears...');
    await page.waitForSelector('text="Let\'s set up your new project."');
    
    console.log('Starting Setup...');
    await page.click('button:has-text("Start Setup")');
    
    console.log('Answering Q1: Project Name');
    await page.waitForSelector('text="What should we call this project?"');
    await page.fill('input[type="text"]', 'Playwright Test Project');
    await page.keyboard.press('Enter');
    
    console.log('Answering Q2: Property Address');
    await page.waitForSelector('text="Where is the property located?"');
    await page.fill('input[type="text"]', '123 Testing Lane');
    await page.keyboard.press('Enter');
    
    console.log('Answering Q3: Project Type');
    await page.waitForSelector('text="What type of project is this?"');
    await page.click('button:has-text("Ground-up Development")');
    // Should auto advance
    
    console.log('Answering Q4: Strategy');
    await page.waitForSelector('text="What is your strategy for this property?"');
    await page.click('button:has-text("Build to Rent")');
    
    console.log('Answering Q5: Entity');
    await page.waitForSelector('text="Who is the owner or operating entity?"');
    await page.fill('input[type="text"]', 'Test Entity LLC');
    await page.keyboard.press('Enter');
    
    console.log('Answering Q6: Stage');
    await page.waitForSelector('text="What stage is the project in currently?"');
    await page.click('button:has-text("Pre-development / Feasibility")');
    
    console.log('Answering Q7: Acquisition Status');
    await page.waitForSelector('text="Is the property already acquired?"');
    await page.click('button:has-text("Yes, Already Acquired")');
    
    console.log('Answering Q8: Acquisition Date');
    await page.waitForSelector('text=When was the property acquired');
    await page.fill('input[type="date"]', '2026-10-08');
    await page.keyboard.press('Enter');
    
    console.log('Answering Q9: Acquisition Cost');
    await page.waitForSelector('text="What is the acquisition cost?"');
    await page.fill('input[type="text"]', '1500000');
    await page.keyboard.press('Enter');
    
    console.log('Answering Q10: Funding Method');
    await page.waitForSelector('text="How will this project be funded?"');
    await page.click('button:has-text("Debt / Loan")');
    
    console.log('Answering Q11: Total Cost');
    await page.waitForSelector('text="What is the estimated total project cost?"');
    await page.fill('input[type="text"]', '5000000');
    await page.keyboard.press('Enter');
    
    console.log('Answering Q12: Completion Date');
    await page.waitForSelector('text="When is the target completion date?"');
    await page.fill('input[type="date"]', '2027-12-31');
    await page.keyboard.press('Enter');
    
    console.log('Answering Q13: Project Manager');
    await page.waitForSelector('text="Who will be the lead project manager?"');
    await page.fill('input[type="text"]', 'Jane Doe');
    await page.click('button:has-text("Review Details")');
    
    console.log('Reviewing Details...');
    await page.waitForSelector('text="Review Project Details"');
    await page.click('button:has-text("Create Project")');
    
    console.log('Checking Success Screen...');
    await page.waitForSelector('text="Project Created!"', { timeout: 3000 });
    
    console.log('All tests passed successfully! The New Project workflow is working perfectly.');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
