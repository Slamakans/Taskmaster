const Discord = require('discord.js');
const RichEmbed = Discord.RichEmbed;
const Collection = Discord.Collection;

module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  if (!client.checklists.has(message.channel.id)) {
    client.checklists.set(message.channel.id, new Collection());
  }
  const checklists = client.checklists.get(message.channel.id);
  client.emit('debug', require('util').inspect(checklists));
  let listID;
  if (checklists.size === 0) {
    listID = 1;
  } else {
    checklists.array()
      .sort((a, b) => a.listID - b.listID)
      .some((e, i, a) => {
        if (e.listID !== (i + 1)) {
          listID = i + 1;
        } else if ((i + 1) === a.length) {
          listID = a.length + 1;
        }
        /* .every continues until it returns false */
        return e.listID === (i + 1);
      });
  }

  const embed = new RichEmbed();
  embed
    .setTitle(`#${listID} ${args.join(' ')}`)
    .setColor(0x8DEEEE);

  return message.channel.sendEmbed(embed)
    .then(m => {
      checklists.set(m.id, {
        listID,
        embed,
        message: { id: m.id },
      });
    })
    .then(() => message.delete())
    .then(resolve, reject);
});
