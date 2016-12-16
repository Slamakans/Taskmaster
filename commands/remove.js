module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const list = Number(args.shift());
  const entry = Number(args.shift());
  if (isNaN(list) || isNaN(entry)) {
    return reject('!remove <list#> <title> <text>');
  }

  const checklist = client.checklists.get(message.channel.id).find('id', list);
  if (!checklist) { return reject('Create a checklist using `!create` first'); }

  let msg;
  try {
    msg = await message.channel.fetchMessage(checklist.message.id);
  } catch (err) {
    delete client.checklists[checklist.message.id];
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
