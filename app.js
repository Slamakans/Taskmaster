const Discord = require('discord.js');
const Collection = Discord.Collection;
const client = new Discord.Client();
const PREFIX = '!';
const COMMANDS = {
  create: require('./commands/create.js'),
  add: require('./commands/add.js'),
  edit: require('./commands/edit.js'),
  remove: require('./commands/remove.js'),
  complete: require('./commands/complete.js'),
  undo: require('./commands/incomplete.js'),
  wip: require('./commands/wip.js'),
  purge: require('./commands/purge.js'),
  clear: require('./commands/clear.js'),
  eval: require('./commands/eval.js'),
};

client.on('message', async message => {
  let { guild, author, member, content } = message;
  try {
    if (!guild || !author || author.bot) { return; }
    if (!content.toLowerCase().startsWith(PREFIX)) { return; }
    if (!member) {
      member = await guild.fetchMember(author);
    }

    const { command, args } = processContent(content);

    const commandFunction = COMMANDS[command] || null;
    if (commandFunction) {
      const start = Date.now();
      client.emit('info', `${message.author.username} is executing ${command}`);
      commandFunction(client, message, args)
        .then(() =>
          client.emit('info', `${message.author.username} finished executing ${command} (${Date.now() - start} ms})`)
        )
        .catch(e => message.channel.sendMessage(e.stack).then(m => m.delete(10000)).then(() => message.delete()));
    }
  } catch (err) {
    client.emit('error', err);
  }
});

client.on('messageDelete', async message => {
  if (client.checklists.delete(message.id)) {
    delete client.checklists.delete(message.id);
    client.emit('info', 'A checklist was deleted');
  }
});

client.on('ready', () => {
  client.EMOJIS = {
    COMPLETE: '💚',
    WIP: '💛',
    INCOMPLETE: '❤',
  };
  try {
    client.checklists = new Collection(
      require('./data/checklists.json')
        .map(channel => [channel[0], new Collection([channel[1]])])
    );
    client.emit('info', 'Checklists loaded');
  } catch (err) {
    client.emit('error', err);
    client.emit('info', 'data/checklists.json not found, creating file...');
    fs.writeFileSync('data/checklists.json', '[]');
    client.checklists = new Collection();
  }
  client.emit('info', 'Bot is connected and ready');
});

client.on('disconnect', () => client.emit('info', 'Bot disconnected'));

function processContent(content) {
  // const lowercase = content.toLowerCase();
  const args = content.split(' ');
  const command = args.shift().toLowerCase().replace(new RegExp(`^${PREFIX.toLowerCase()}`, 'i'), '');
  const segments = [[]];
  args.forEach((e, i, a) => {
    if (segments[segments.length - 1].length === 2) segments.push([]);
    if (e.startsWith('"')) segments[segments.length - 1].push(i);
    if (e.endsWith('"')) segments[segments.length - 1].push(i);
    a[i] = e.replace(/(^"|"$)/, '');
  });
  let offset = 0;
  segments.forEach(segment => {
    if (segment.length !== 2) return;
    const start = segment[0];
    const count = 1 + (segment[1] - start);
    const removed = args.splice(start + offset, count);
    args.splice(start + offset, 0, removed.join(' '));
    offset -= count - 1;
  });

  return { command, args };
}

const fs = require('fs');
const _saveChecklists = () => {
  // client.emit('debug', require('util').inspect(client.checklists));
  fs.writeFileSync(
    'data/checklists.json',
    JSON.stringify([...client.checklists.map((e, k) => [k, ...e])], undefined, 4)
  );
  client.emit('debug', 'Saved checklists.json');
};
setInterval(_saveChecklists, 30000);

client.on('info', console.log);
client.on('debug', console.log);
client.on('error', console.log);

client.login(require('./auth.json').token);
