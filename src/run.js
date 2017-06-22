'use strict';

const config = require('../config');
const Cmr1Cli = require('cmr1-cli');
const Bot = require('cmr1-ts3-bot');
const async = require('async');
const msgs = require('./msgs');
const gw2 = require('./gw2');

const botCli = new Cmr1Cli({
  name: 'TS3 GW2 Verify Bot',
  description: 'A bot to verify GuildWars2 account info within TeamSpeak3',
  helpHeader: 'Available Options',
  optionDefinitions: config.cli.optionDefinitions
});

botCli.log(botCli.options);

const defaultGroup = 'Normal';

const homeWorld = botCli.options.homeworld || process.env.GW2_HOME_WORLD || null;
const homeGroup = botCli.options.homegroup || process.env.GW2_HOME_GROUP || defaultGroup;
const linkedWorlds = botCli.options.linkedworlds || process.env.GW2_LINKED_WORLDS ? process.env.GW2_LINKED_WORLDS.split(',') : [];
const linkedGroup = botCli.options.linkedgroup || process.env.GW2_LINKED_GROUP || defaultGroup;

const bot = new Bot(botCli.options);

bot.init();

bot.on('join', channel => {
  channel.message(`Ready for service.`);
});

bot.on('cliententerchannel', context => {
  context.channel.message(msgs.hint);
  context.client.message(`Hi ${context.client.client_nickname}! My name is ${bot.options.name}, I can help verify your GuildWars2 account information and automatically add you to the appropriate TeamSpeak group(s)!\n${msgs.hint}`);  
});

bot.on('unknowncommand', context => {
  context.client.message(`Sorry, I don't know how to process that request. Please try again.\n${msgs.hint}`);
});

bot.globalCommand('help', (args, context) => {
  context.client.message(msgs.help);
});

bot.globalCommand('verifyme', (args, context) => {
  context.client.message(msgs.help);
});

bot.clientCommand('apikey', (args, context) => {
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
            bot.logger.debug(err);
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

          if (!homeWorld || homeWorld === 'none' || homeWorld.trim() === '') {
            addGroup = defaultGroup;
          } else if (resp.world.name === homeWorld) {
            addGroup = homeGroup;
          } else if (linkedWorlds.indexOf(resp.world.name) !== -1) {
            addGroup = linkedGroup;
          } else {
            context.client.message(`I'm sorry, but automatic verification is not currently enabled for ${resp.world.name}.`);
            return;
          }

          if (addGroup) {
            context.client.addToServerGroup(addGroup, err => {
              if (err) {
                bot.logger.warn(err);
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