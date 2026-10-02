import puppeteer from 'puppeteer';
import mongoose from 'mongoose';

const uri = "mongodb://yaseenpalmland777_db_user:XNdH9FJu1NcjozMO@ac-v9omr6r-shard-00-00.91gdnin.mongodb.net:27017,ac-v9omr6r-shard-00-01.91gdnin.mongodb.net:27017,ac-v9omr6r-shard-00-02.91gdnin.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-m0o3wy-shard-0&appName=almahsan";

const TVStateSchema = new mongoose.Schema({}, { strict: false });
const TVState = mongoose.models.TVState || mongoose.model('TVState', TVStateSchema);

async function setDesign1() {
  await mongoose.connect(uri);
  await TVState.findOneAndUpdate({}, { 
    $set: { 
      isActive: true,
      displayEnabled: true,
      leaderboardDesign: 'design1',
      presentationType: null,
      presentationId: null,
      'config.presentation': 'design1'
    } 
  });
  await mongoose.disconnect();
  console.log("Set TV state to design1");
}

async function capture() {
  await setDesign1();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); // 16:9 TV resolution

  await page.goto('http://localhost:3000/tv', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'scratch/original_leaderboard_1920x1080.png' });
  console.log("Saved screenshot to scratch/original_leaderboard_1920x1080.png");

  await browser.close();
}

capture().catch(console.error);
