import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Events, ActivityType } from 'discord.js';

const prefix = process.env.COMMAND_PREFIX ?? '!';
const enableMsg = String(process.env.ENABLE_MESSAGE_COMMANDS).toLowerCase() === 'true';

const intents = [GatewayIntentBits.Guilds];
if (enableMsg) intents.push(GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent);

const client = new Client({ intents, partials: [Partials.Channel] });

client.once(Events.ClientReady, (c) => {
  const status = (process.env.PRESENCE_STATUS || 'online');
  const actType = ActivityType[process.env.ACTIVITY_TYPE || 'PLAYING'] ?? ActivityType.Playing;
  const actText = process.env.ACTIVITY_TEXT || 'ApexOrder servers';
  c.user.setPresence({ status, activities: [{ type: actType, name: actText }] });
  console.log(`✅ Logged in as ${c.user.tag} | prefix=${prefix} | msgCommands=${enableMsg}`);
});

// Slash: /ping
client.on(Events.InteractionCreate, async (i) => {
  if (!i.isChatInputCommand()) return;
  if (i.commandName === 'ping') {
    const sent = await i.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - i.createdTimestamp;
    await i.editReply(`🏓 Pong! ${latency}ms`);
  }
});

// Prefix: !ping
if (enableMsg) {
  client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || !msg.guild) return;
    if (!msg.content.startsWith(prefix)) return;
    const [cmd] = msg.content.slice(prefix.length).trim().split(/\s+/);
    if ((cmd || '').toLowerCase() === 'ping') {
      await msg.reply('🏓 Pong! (prefix)');
    }
  });
}

const token = process.env.DISCORD_TOKEN;
if (!token) { console.error('❌ DISCORD_TOKEN not set'); process.exit(1); }
client.login(token);
