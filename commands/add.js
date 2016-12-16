const Discord = require('discord.js');
const RichEmbed = Discord.RichEmbed;
const Collection = Discord.Collection;

module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const list = Number(args.shift());
  if (isNaN(list)) {
    return reject(
`!add <list#> <title> [text]
Use \`"\` for the title and text if you want multiple words.`
    );
  }

  if (!client.checklists.has(message.channel.id)) {
    client.checklists.set(message.channel.id, new Collection());
  }
  const checklist = client.checklists.get(message.channel.id).find('listID', list);
  if (!checklist) { return reject('Create a checklist using `!create` first'); }

  let msg;
  try {
    msg = await message.channel.fetchMessage(checklist.message.id);
  } catch (err) {
    delete client.checklists.delete(checklist.channel.id);
    return message.delete().then(resolve, reject);
  }

  const embed = new RichEmbed(checklist.embed);
  embed
    .addField(`**${
      checklist.embed.fields ? checklist.embed.fields.length + 1 : 1
    }** ${client.EMOJIS.INCOMPLETE} ${args[0]}`,
    args[1] || 'DEFAULT TEXT, edit with _!edit <list#> <entry#> <title> [text]_'
  );

  return msg.edit('', { embed })
    .then(() => message.delete())
    .then(resolve, reject);
});
