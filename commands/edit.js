const Discord = require('discord.js');
const Collection = Discord.Collection;

module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const list = Number(args.shift());
  const entry = Number(args.shift());
  if (isNaN(list) || isNaN(entry)) { return reject('!edit <list#> <entry#> <title> [text]'); }

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
    return message.delete()
      .then(resolve)
      .catch(e => reject(e));
  }
  const field = checklist.embed.fields[entry - 1];
  if (!field) { return reject('Invalid numero'); }

  client.emit('debug', field.name);
  client.emit('debug', args);
  field.name = field.name.replace(
    /(\*\*\d+?\*\* . )(.|[\r\n])*/,
    `${'$1'}${args.length > 2 ? args.join(' ') : args.shift()}`
  );
  client.emit('debug', field.name);
  const text = args.shift();
  if (text && args.length === 0) {
    field.value = text;
  }

  return msg.edit('', { embed: checklist.embed })
    .then(() => message.delete())
    .then(resolve)
    .catch(e => reject(e));
});
