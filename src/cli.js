const Cmr1Cli = require('cmr1-cli');

const additionalOptions = [
  {
    name: 'name',
    alias: 'n', 
    type: String, 
    description: 'Bot name', 
    typeLabel: '[underline]{name}'
  },
  {
    name: 'sid',
    alias: 's', 
    type: Number, 
    description: 'TS3 server SID (virtual server id)', 
    typeLabel: '[underline]{sid}' 
  },
  {
    name: 'user',
    alias: 'u', 
    type: String, 
    description: 'TS3 ServerQuery user', 
    typeLabel: '[underline]{user}' 
  },
  {
    name: 'pass',
    alias: 'p', 
    type: String, 
    defaultOption: true, 
    description: 'TS3 ServerQuery pass', 
    typeLabel: '[underline]{pass}' 
  },
  {
    name: 'channel',
    alias: 'c', 
    type: String, 
    description: 'Channel for bot to join', 
    typeLabel: '[underline]{channel}' 
  },
  {
    name: 'host',
    alias: 'i', 
    type: String, 
    description: 'TS3 server hostname (or IP)', 
    typeLabel: '[underline]{host}' 
  },
  {
    name: 'port',
    alias: 't', 
    type: Number, 
    description: 'TS3 ServerQuery port', 
    typeLabel: '[underline]{port}' 
  },
  {
    name: 'homeworld',
    alias: 'w', 
    type: String, 
    description: 'GW2 home world', 
    typeLabel: '[underline]{homeworld}' 
  },
  {
    name: 'homegroup',
    alias: 'g', 
    type: String, 
    description: 'TS3 server group to add to users from [underline]{homeworld}', 
    typeLabel: '[underline]{homegroup}' 
  },
  {
    name: 'linkedworlds',
    alias: 'd', 
    type: String, 
    multiple: true, 
    description: 'GW2 linked world(s) (allows multiple values)', 
    typeLabel: '[underline]{linkedworlds}' 
  },
  {
    name: 'linkedgroup',
    alias: 'e', 
    type: String, 
    description: 'TS3 server group to add to users from any [underline]{linkedworlds}', 
    typeLabel: '[underline]{linkedgroup}' 
  }
];

const botCli = new Cmr1Cli({
  name: 'Woodhouse',
  description: 'A bot to verify GuildWars2 account info within TeamSpeak3',
  helpHeader: 'Available Options',
  optionDefinitions: additionalOptions
});

botCli.log(botCli.options);
