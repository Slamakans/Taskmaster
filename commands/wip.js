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

  const userMentionRegex = /(?:\s*)<@!?\d+>(?:\s*)/g;
  /* Convert to author string and put in array, don't want no funny business going on with .join */
  const mentions = message.content.match(userMentionRegex) || [`${message.author}`];

  field.name = field.name.replace(
    new RegExp(`${client.EMOJIS.INCOMPLETE}|${client.EMOJIS.COMPLETE}`),
    client.EMOJIS.WIP
  )
  .replace(userMentionRegex, '');

  field.name = field.name.replace(
    /\*\*\d+?\*\* :.+?: (.|[\r\n])*?/,
    `${'$0'}${args.length > 2 ? args.join(' ') : args.shift()}`
  );

  field.name += ` (_WIP by ${mentions.join(' ')}_)`;

  return msg.edit('', { embed: checklist.embed })
    .then(() => message.delete())
    .then(resolve, reject);
});
