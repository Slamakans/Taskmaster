const RichEmbed = require('discord.js').RichEmbed;

module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const embed = new RichEmbed();
  embed
    .setTitle(args.join(' '))
    .setColor(0x8DEEEE);
  return message.channel.sendEmbed(embed)
    .then(m => {
      client.checklists[m.id] = {
        embed,
        timestamp: m.createdTimestamp,
        message: { id: m.id },
        channel: { id: message.channel.id },
      };
    })
    .then(() => message.delete())
    .then(resolve, reject);
});
