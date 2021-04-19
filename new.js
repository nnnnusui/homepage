const execSync = require('child_process').execSync;

const dateTime = Math.floor(new Date().getTime() / 1000);
const path = `src/${dateTime}.m5`
execSync(`code ${path}`, { stdio: [0, 1, 2]} );
