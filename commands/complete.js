const Discord = require('discord.js');
const Collection = Discord.Collection;

module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const list = Number(args.shift());
  const entry = Number(args.shift());
  if (isNaN(list) || isNaN(entry)) { return reject('!complete <list#> <entry#>'); }

  if (!client.checklists.has(message.channel.id)) {
    client.checklists.set(message.channel.id, new Collection());
  }
  const checklist = client.checklists.get(message.channel.id).find('listID', list);
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
    new RegExp(`${client.EMOJIS.INCOMPLETE}|${client.EMOJIS.WIP}`),
    client.EMOJIS.COMPLETE
  ).replace(/ \(_(WIP)(.+?)\)$/, ' (_Completed$2)');

  field.name = field.name.replace(
    /(\*\*\d+?\*\* :.+?: )(.|[\r\n])*?/,
    `${'$1'}~~${args.length > 2 ? args.join(' ') : args.shift()}~~`
  );

  return msg.edit('', { embed: checklist.embed })
    .then(() => message.delete())
    .then(resolve, reject);
});
