// Quick test of live GitHub Pages site
import { chromium } from 'playwright';

async function testLiveSite() {
  console.log('🌐 Testing Live GitHub Pages Site...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 1000 // Slow down for visibility
  });
  
  const page = await browser.newPage();
  
  try {
    const url = 'https://zhanibek55.github.io/film-radar-tracker/';
    console.log(`🔗 Opening: ${url}`);
    
    // Navigate to site
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Take screenshot
    await page.screenshot({ path: 'live-site-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved: live-site-screenshot.png');
    
    // Get page title
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    
    // Get page content
    const bodyText = await page.textContent('body');
    console.log(`📝 Page content (first 300 chars):\n${bodyText?.substring(0, 300)}...`);
    
    // Check if React loaded
    const reactRoot = await page.locator('#root').textContent();
    console.log(`⚛️  React root content: ${reactRoot?.substring(0, 100)}...`);
    
    // Check for specific elements
    const hasHeading = await page.locator('h1').count();
    const hasTabs = await page.locator('[role="tab"]').count();
    const hasButtons = await page.locator('button').count();
    
    console.log(`\n🔍 Element counts:`);
    console.log(`   H1 headings: ${hasHeading}`);
    console.log(`   Tab elements: ${hasTabs}`);
    console.log(`   Buttons: ${hasButtons}`);
    
    // Wait a bit to see the page
    console.log('\n⏳ Waiting 5 seconds to observe the page...');
    await page.waitForTimeout(5000);
    
    return true;
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testLiveSite().catch(console.error);