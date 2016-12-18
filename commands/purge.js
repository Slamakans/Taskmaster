module.exports = (client, message, args) => new Promise(async resolve => {
  const amount = Number(args[0]);
  if (!isNaN(amount)) {
    await message.channel.bulkDelete(amount);
    resolve();
  }
});
