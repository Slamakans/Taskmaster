module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const checklist = client.checklists[Object.keys(client.checklists)
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .find(key => client.checklists[key].channel.id === message.channel.id)];
  if (!checklist) { return reject('Create a checklist using `!create` first'); }

  const number = args.shift();
  if (isNaN(Number(number))) { return reject('!undo [number]'); }

  let msg;
  try {
    msg = await message.channel.fetchMessage(checklist.message.id);
  } catch (err) {
    delete client.checklists[checklist.message.id];
    return message.delete().then(resolve, reject);
  }
  const field = checklist.embed.fields[number - 1];
  if (!field) { return reject('Invalid numero'); }

  field.name = field.name.replace(
    new RegExp(`${client.EMOJIS.COMPLETE}|${client.EMOJIS.WIP}`),
    client.EMOJIS.INCOMPLETE
  ).replace(/ \(.+?\)$/, '');

  return msg.edit('', { embed: checklist.embed })
    .then(() => message.delete())
    .then(resolve, reject);
});
