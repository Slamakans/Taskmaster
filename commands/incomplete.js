const Discord = require('discord.js');
const Collection = Discord.Collection;

module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const list = Number(args.shift());
  const entry = Number(args.shift());
  if (isNaN(list) || isNaN(entry)) { return reject('!undo <list#> <entry#>'); }

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
  const field = checklist.embed.fields[entry - 1];
  if (!field) { return reject('Invalid numero'); }

  /* Changes the emoji and removes mentions */
  field.name = field.name.replace(
    new RegExp(`${client.EMOJIS.COMPLETE}|${client.EMOJIS.WIP}`),
    client.EMOJIS.INCOMPLETE
  )
  /* Remove the (Completed/WIP by X) */
  .replace(/ \(.+?\)$/, '');

  return msg.edit('', { embed: checklist.embed })
    .then(() => message.delete())
    .then(resolve, reject);
});
