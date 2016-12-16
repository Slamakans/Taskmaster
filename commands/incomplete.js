module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const list = Number(args.shift());
  const entry = Number(args.shift());
  if (isNaN(list) || isNaN(entry)) { return reject('!undo <list#> <entry#>'); }

  const checklist = client.checklists.get(message.channel.id).find('id', list);
  if (!checklist) { return reject('Create a checklist using `!create` first'); }

  let msg;
  try {
    msg = await message.channel.fetchMessage(checklist.message.id);
  } catch (err) {
    delete client.checklists.delete(checklist.channel.id);
    return message.delete().then(resolve, reject);
  }
  const field = checklist.embed.fields[entry - 1];
  if (!field) { return reject('Invalid numero'); }

  field.name = field.name.replace(
    new RegExp(`${client.EMOJIS.COMPLETE}|${client.EMOJIS.WIP}`),
    client.EMOJIS.INCOMPLETE
  ).replace(/ \(.+?\)$/, '');

  return msg.edit('', { embed: checklist.embed })
    .then(() => message.delete())
    .then(resolve, reject);
});
