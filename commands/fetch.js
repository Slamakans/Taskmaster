module.exports = (client, message, args) => new Promise(async (resolve, reject) => {
  const id = args[0];
  try {
    const m = await message.channel.fetchMessage(id);
    const embed = m.embeds[0];
    const listID = embed.title.match(/^#(\d+)/)[1];
    client.checklists.get(message.channel.id).set(m.id, {
      listID,
      embed,
      message: { id: m.id },
    });
    resolve();
  } catch (err) {
    if (err.message.startsWith('Not found')) {
      reject('Couldn\'t find a message with that id.');
    } else if (err.stack.includes('read property \'1\' of null')) {
      reject('That\'s not a valid checklist');
    }
  }
});
