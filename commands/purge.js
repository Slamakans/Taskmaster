module.exports = (client, message, args) => new Promise(async () => {
  const amount = parseInt(args[0]);
  if (!isNaN(amount)) {
    await message.channel.bulkDelete(amount);
  }
});
