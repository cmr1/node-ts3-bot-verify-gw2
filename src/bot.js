'use strict';

const config = require('../config');
const Bot = require('cmr1-ts3-bot');
const async = require('async');
const msgs = require('./msgs');
const gw2 = require('./gw2');

class VerifyGw2Bot extends Bot {
  constructor(options = {}) {
    super(options);

    this.defaultGroup = config.constants.DEFAULT_GROUP || 'Normal';

    this.homeWorld = options.homeworld || process.env.GW2_HOME_WORLD || null;
    this.homeGroup = options.homegroup || process.env.GW2_HOME_GROUP || this.defaultGroup;
    this.linkedWorlds = options.linkedworlds || process.env.GW2_LINKED_WORLDS ? process.env.GW2_LINKED_WORLDS.split(',') : [];
    this.linkedGroup = options.linkedgroup || process.env.GW2_LINKED_GROUP || this.defaultGroup;

    this._configureEvents();
    this._configureCommands();
  }

  _configureEvents() {
    this.on('join', channel => {
      channel.message(`Ready for service.`);
    });

    this.on('cliententerchannel', context => {
      context.channel.message(msgs.hint);
      context.client.message(`Hi ${context.client.client_nickname}! My name is ${this.options.name}, I can help verify your GuildWars2 account information and automatically add you to the appropriate TeamSpeak group(s)!\n${msgs.hint}`);  
    });

    this.on('unknowncommand', context => {
      context.client.message(`Sorry, I don't know how to process that request. Please try again.\n${msgs.hint}`);
    });
  }

  _configureCommands() {
    this.globalCommand('help', (args, context) => {
      context.client.message(msgs.help);
    });

    this.globalCommand('verifyme', (args, context) => {
      context.client.message(msgs.help);
    });

    this.clientCommand('apikey', (args, context) => {
      context.client.message('Thanks! Let me look up your account information...');

      gw2.lookup(args[1], (err, resp) => {
        if (err) {
          context.client.message(`I'm sorry, I have encountered an error: ${err}`);
        } else {
          async.concat(resp.guilds.map(g => g.tag), (group, next) => {
            context.client.addToServerGroup(group, (err) => {
              if (err && err.error_id && err.error_id === 2561) {
                next(null, group);
              } else if (err) {
                this.logger.debug(err);
                next();
              } else {
                next(null, group);            
              }
            });
          }, (err, groups) => {
            if (err) {
              context.client.message(`I'm sorry, I have encountered an error: ${err}`);         
            } else if (groups && groups.length > 0) {
              context.client.message(`You are a member of the group(s): ${groups}`);
            } else {
              let addGroup = null;

              if (!this.homeWorld || this.homeWorld === 'none' || this.homeWorld.trim() === '') {
                addGroup = this.defaultGroup;
              } else if (resp.world.name === this.homeWorld) {
                addGroup = this.homeGroup;
              } else if (this.linkedWorlds.indexOf(resp.world.name) !== -1) {
                addGroup = this.linkedGroup;
              } else {
                context.client.message(`I'm sorry, but automatic verification is not currently enabled for ${resp.world.name}.`);
                return;
              }

              if (addGroup) {
                context.client.addToServerGroup(addGroup, err => {
                  if (err) {
                    this.logger.warn(err);
                    context.client.message(`I'm sorry, I have encountered an error: ${err.message || 'Unknown'}`);
                    context.client.message(`It appears your API KEY is valid, but I am unable to add you to the correct TS group(s)! Please contact an admin for further assistance.`);
                  } else {
                    context.client.message(`You have been added to the group: ${addGroup}`);
                  }
                });
              }
            }
          });
        }
      });
    });
  }
}

module.exports = VerifyGw2Bot;
