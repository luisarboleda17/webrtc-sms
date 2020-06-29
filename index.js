
require('dotenv').config()
const Mongoose = require('mongoose');

const createApp = require('./app');

const initApp = async () => {
  try {
    await Mongoose.connect(
      process.env.MONGO_DB_URI,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }
    );

    const app = createApp();
    await app.start();

    console.info(`${app.settings.app.name} started`);
    console.info(`Environment: ${app.settings.app.env}`);
    console.info(`SMS enabled: ${app.settings.app.nexmo.sendSmsEnabled}`);
    console.info(`You can access at ${app.info.uri}`);
  } catch(err) {
    console.error('Error starting server', err);
    process.exit(1);
  }
};

initApp();