'use strict';

const config = require('../config');
const Cmr1Cli = require('cmr1-cli');
const Bot = require('./bot');

class VerifyGw2BotCli extends Cmr1Cli {
  constructor() {
    super(config.cli);

    this.bot = new Bot(this.options);
  }

  run() {
    this.bot.init();
  }
}

module.exports = VerifyGw2BotCli;