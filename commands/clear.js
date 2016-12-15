module.exports = (client, message, args) => new Promise(async () => {
  const amount = parseInt(args[0]);
  if (!isNaN(amount)) {
    const messages = await message.channel.fetchMessages({ limit: amount });
    await messages.filter(m => m.author.id === client.user.id).deleteAll();
  }
});
