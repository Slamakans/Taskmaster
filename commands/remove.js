module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const checklist = client.checklists[Object.keys(client.checklists)
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .find(key => client.checklists[key].channel.id === message.channel.id)];
  if (!checklist) { return reject('Create a checklist using `!create` first'); }

  const number = args.shift();
  if (isNaN(Number(number))) { return reject('!remove [number]'); }

  let msg;
  try {
    msg = await message.channel.fetchMessage(checklist.message.id);
  } catch (err) {
    delete client.checklists[checklist.message.id];
    return message.delete().then(resolve, reject);
  }
  const embed = checklist.embed;
  embed.fields = embed.fields.filter(field => !field.name.startsWith(`**${number}**`));
  embed.fields.forEach((field, i) => {
    field.name = field.name.replace(/^\*\*\d+?\*\*/, `**${i + 1}**`);
  });

  return msg.edit('', { embed })
    .then(() => message.delete())
    .then(resolve, reject);
});
