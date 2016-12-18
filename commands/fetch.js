const Collection = require('discord.js').Collection;
const RichEmbed = require('discord.js').RichEmbed;

module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const id = args[0];
  try {
    const m = await message.channel.fetchMessage(id);
    if (m.embeds[0] && m.embeds[0].fields) {
      m.embeds[0].fields.forEach(field => delete field.embed);
    }
    const embed = new RichEmbed(m.embeds[0]);
    const listID = embed.title.match(/^#(\d+)/)[1];
    if (!client.checklists.has(message.channel.id)) {
      client.checklists.set(message.channel.id, new Collection());
    }
    client.checklists.get(message.channel.id).set(m.id, {
      listID,
      embed,
      message: { id: m.id },
    });
    message.channel.sendMessage('Aight')
      .then(response => response.delete(2000))
      .then(() => message.delete())
      .then(resolve);
  } catch (err) {
    if (err.message.startsWith('Not found')) {
      reject('Couldn\'t find a message with that id.');
    } else if (err.stack.includes('read property \'1\' of null')) {
      reject('That\'s not a valid checklist');
    } else {
      reject(err);
    }
  }
});
