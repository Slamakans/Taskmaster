const Discord = require('discord.js');
const Collection = Discord.Collection;

module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const list = Number(args.shift());
  const entry = Number(args.shift());
  if (isNaN(list) || isNaN(entry)) {
    return reject('!remove <list#> <entry#>');
  }

  if (!client.checklists.has(message.channel.id)) {
    client.checklists.set(message.channel.id, new Collection());
  }
  const checklist = client.checklists.get(message.channel.id).find(c => Number(c.listID) === list);
  if (!checklist) { return reject('Create a checklist using `!create` first'); }

  let msg;
  try {
    msg = await message.channel.fetchMessage(checklist.message.id);
  } catch (err) {
    delete client.checklists.delete(checklist.message.id);
    return message.delete().then(resolve, reject);
  }
  const embed = checklist.embed;
  embed.fields = embed.fields.filter(field => !field.name.startsWith(`**${entry}**`));
  embed.fields.forEach((field, i) => {
    field.name = field.name.replace(/^\*\*\d+?\*\*/, `**${i + 1}**`);
  });

  return msg.edit('', { embed })
    .then(() => message.delete())
    .then(resolve, reject);
});
