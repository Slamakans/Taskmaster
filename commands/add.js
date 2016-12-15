const RichEmbed = require('discord.js').RichEmbed;

module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const checklist = client.checklists[Object.keys(client.checklists)
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .find(key => client.checklists[key].channel.id === message.channel.id)];
  if (!checklist) { return reject('Create a checklist using `!create` first'); }

  let msg;
  try {
    msg = await message.channel.fetchMessage(checklist.message.id);
  } catch (err) {
    delete client.checklists[checklist.message.id];
    return message.delete().then(resolve, reject);
  }
  const embed = new RichEmbed(checklist.embed);
  embed
    .addField(`**${
      checklist.embed.fields ? checklist.embed.fields.length + 1 : 1
    }** ${client.EMOJIS.INCOMPLETE} ${args[0]}`, args[1]);
  return msg.edit('', { embed })
    .then(() => message.delete())
    .then(resolve, reject);
});
