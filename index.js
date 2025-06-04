require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

// Collections for commands and music queues
client.commands = new Collection();
client.queues = new Collection();

// Load command files
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Ready event
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online and ready!`);
    console.log(`📊 Serving ${client.guilds.cache.size} guilds`);
    
    // Set bot activity
    client.user.setActivity('music 🎵', { type: 'LISTENING' });
});

// Interaction handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error('Error executing command:', error);
        
        const errorMessage = 'There was an error while executing this command!';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// Voice state update handling
client.on('voiceStateUpdate', (oldState, newState) => {
    // Check if the bot was disconnected from a voice channel
    if (oldState.member.id === client.user.id && oldState.channelId && !newState.channelId) {
        const queue = client.queues.get(oldState.guild.id);
        if (queue) {
            queue.destroy();
            client.queues.delete(oldState.guild.id);
        }
    }
    
    // Auto-disconnect if bot is alone in voice channel
    if (oldState.channelId && oldState.channel && oldState.channel.members.size === 1) {
        const botMember = oldState.channel.members.find(member => member.id === client.user.id);
        if (botMember) {
            const connection = getVoiceConnection(oldState.guild.id);
            if (connection) {
                const queue = client.queues.get(oldState.guild.id);
                if (queue) {
                    queue.destroy();
                    client.queues.delete(oldState.guild.id);
                }
                connection.destroy();
            }
        }
    }
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
