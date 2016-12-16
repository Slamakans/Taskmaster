module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const list = Number(args.shift());
  const entry = Number(args.shift());
  if (isNaN(list) || isNaN(entry)) { return reject('!wip <list#> <entry#>'); }

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

  const userMentionRegex = /(?:\s*)<@!?\d+>(?:\s*)/g;
  /* Convert to author string and put in array, don't want no funny business going on with .join */
  const mentions = message.content.match(userMentionRegex) || [`${message.author}`];

  /* Changes the emoji and removes mentions */
  field.name = field.name.replace(
    new RegExp(`${client.EMOJIS.INCOMPLETE}|${client.EMOJIS.COMPLETE}`),
    client.EMOJIS.WIP
  )
  .replace(userMentionRegex, '');

  /* Replaces the old title with the new title */
  field.name = field.name.replace(
    /\*\*\d+?\*\* :.+?: (.|[\r\n])*?/,
    `${'$0'}${args.length > 2 ? args.join(' ') : args.shift()}`
  );

  /* Adds the new mentions */
  field.name += ` (_WIP by ${mentions.join(' ')}_)`;

  return msg.edit('', { embed: checklist.embed })
    .then(() => message.delete())
    .then(resolve, reject);
});
