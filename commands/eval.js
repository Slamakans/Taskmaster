/* eslint-disable */
const Discord = require('discord.js');
const fs = require('fs');
/* eslint-enable */

module.exports = (client, message) => new Promise(async () => {
  const code = message.content.split(' ').splice(1).join(' ');
  try {
    let evaled = eval(code);
    if (typeof evaled !== 'string') {
      evaled = require('util').inspect(evaled);
    }

    message.channel.sendCode('xl', clean(evaled));
  } catch (err) {
    message.channel.sendMessage(`${'`ERROR` ```xl\n'}${clean(err.stack)}${'```'}`)
      .catch(() => {
        client.emit('error', err);
      });
  }
});

const clean = text => typeof text === 'string' ? text.replace(/[`@]/g, v => `${v}${String.fromCharCode(8203)}`) : text;
