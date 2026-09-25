const fs = require('fs');
const mongoose = require('mongoose');

let uri = 'mongodb://127.0.0.1:27017/musabaqa';
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  const match = content.match(/MONGODB_URI=(.+)/);
  if (match) uri = match[1].trim();
} else if (fs.existsSync('.env')) {
  const content = fs.readFileSync('.env', 'utf8');
  const match = content.match(/MONGODB_URI=(.+)/);
  if (match) uri = match[1].trim();
}

const design = process.argv[2] || 'design1';

async function setDesign() {
  await mongoose.connect(uri);
  const TVState = mongoose.model('TVState', new mongoose.Schema({}, { strict: false }), 'tvstates');
  await TVState.updateOne({}, {
    $set: {
      leaderboardDesign: design,
      'config.presentation': design,
      type: `Design ${design.replace('design', '')}`,
      presentationType: null,
      presentationId: null
    }
  });
  console.log(`Updated TVState design to ${design}`);
  await mongoose.disconnect();
}

setDesign();
