const Discord = require('discord.js');
const RichEmbed = Discord.RichEmbed;
const Collection = Discord.Collection;

module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const checklists = client.checklists.get(message.channel.id);
  let id;
  checklists.array()
    .sort((a, b) => a.id - b.id)
    .some((e, i) => {
      if (e.id !== (i + 1)) {
        id = i + 1;
      }
      /* .every continues until it returns false */
      return e.id === (i + 1);
    });

  const embed = new RichEmbed();
  embed
    .setTitle(`#${id} ${args.join(' ')}`)
    .setColor(0x8DEEEE);
  return message.channel.sendEmbed(embed)
    .then(m => {
      if (!client.checklists.has(message.channel.id)) {
        client.checklist.set(message.channel.id, new Collection());
      }
      checklists.set(m.id, {
        id,
        embed,
        message: { id: m.id },
      });
    })
    .then(() => message.delete())
    .then(resolve, reject);
});
