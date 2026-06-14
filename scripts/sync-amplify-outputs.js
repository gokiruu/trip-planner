const fs = require('fs');
const path = require('path');

const rootOutputs = path.resolve(__dirname, '..', 'amplify_outputs.json');
const srcOutputs = path.resolve(__dirname, '..', 'src', 'amplify_outputs.json');

if (!fs.existsSync(rootOutputs)) {
  throw new Error('Missing amplify_outputs.json. Run `npx ampx sandbox` or download it from your deployed Amplify backend.');
}

fs.copyFileSync(rootOutputs, srcOutputs);
console.log('Synced amplify_outputs.json to src/amplify_outputs.json');
