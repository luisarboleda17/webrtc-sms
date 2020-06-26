
require('dotenv').config()

const createApp = require('./app');

const initApp = async () => {
  try {
    const app = createApp();
    await app.start();

    console.info(`${app.settings.app.name} started`);
    console.info(`Environment: ${app.settings.app.env}`);
    console.info(`You can access at ${app.info.uri}`);
  } catch(err) {
    console.error('Error starting server', err);
    process.exit(1);
  }
};

initApp();