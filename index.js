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

// Interaction handling (both slash commands and buttons)
client.on('interactionCreate', async interaction => {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
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
        return;
    }

    // Handle button interactions
    if (interaction.isButton()) {
        const queue = client.queues.get(interaction.guildId);
        
        // Check if user is in the same voice channel as the bot
        const member = interaction.member;
        if (!member.voice.channelId) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use music controls!', ephemeral: true });
        }
        
        if (queue && queue.voiceChannel.id !== member.voice.channelId) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel as the bot!', ephemeral: true });
        }        try {
            switch (interaction.customId) {
                case 'music_pause_resume':
                    if (!queue || !queue.currentSong) {
                        return interaction.reply({ content: '❌ No music is currently playing!', ephemeral: true });
                    }
                    
                    if (queue.isPlaying) {
                        queue.pause();
                        await interaction.reply({ content: '⏸️ Music paused!', ephemeral: true });
                    } else {
                        queue.resume();
                        await interaction.reply({ content: '▶️ Music resumed!', ephemeral: true });
                    }
                    break;

                case 'music_skip':
                    if (!queue || !queue.currentSong) {
                        return interaction.reply({ content: '❌ No music is currently playing!', ephemeral: true });
                    }
                    
                    const skippedSong = queue.currentSong.title;
                    queue.skip();
                    await interaction.reply({ content: `⏭️ Skipped: **${skippedSong}**`, ephemeral: true });
                    break;

                case 'music_stop':
                    if (!queue) {
                        return interaction.reply({ content: '❌ No music queue found!', ephemeral: true });
                    }
                    
                    queue.stop();
                    client.queues.delete(interaction.guildId);
                    await interaction.reply({ content: '⏹️ Music stopped and queue cleared!', ephemeral: true });
                    break;

                case 'music_loop':
                    if (!queue) {
                        return interaction.reply({ content: '❌ No music queue found!', ephemeral: true });
                    }
                    
                    // Cycle through loop modes: off -> song -> queue -> off
                    switch (queue.loop) {
                        case 'off':
                            queue.loop = 'song';
                            await interaction.reply({ content: '🔂 Loop mode: **Song**', ephemeral: true });
                            break;
                        case 'song':
                            queue.loop = 'queue';
                            await interaction.reply({ content: '🔁 Loop mode: **Queue**', ephemeral: true });
                            break;
                        case 'queue':
                            queue.loop = 'off';
                            await interaction.reply({ content: '➡️ Loop mode: **Off**', ephemeral: true });
                            break;
                    }
                    break;

                case 'music_queue':
                    if (!queue) {
                        return interaction.reply({ content: '❌ No music queue found!', ephemeral: true });
                    }
                    
                    let queueMessage = '';
                    
                    if (queue.currentSong) {
                        queueMessage += `**🎵 Now Playing:**\n[${queue.currentSong.title}](${queue.currentSong.url}) - \`${queue.currentSong.duration}\`\n\n`;
                    }
                    
                    if (queue.songs.length > 0) {
                        queueMessage += `**📋 Queue (${queue.songs.length} songs):**\n`;
                        queue.songs.slice(0, 10).forEach((song, index) => {
                            queueMessage += `\`${index + 1}.\` [${song.title}](${song.url}) - \`${song.duration}\`\n`;
                        });
                        
                        if (queue.songs.length > 10) {
                            queueMessage += `\n*... and ${queue.songs.length - 10} more songs*`;
                        }
                    } else if (!queue.currentSong) {
                        queueMessage = '📭 The queue is empty!';
                    } else {
                        queueMessage += '📋 Queue is empty - this is the last song!';
                    }
                    
                    const { EmbedBuilder } = require('discord.js');
                    const embed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .setTitle('🎵 Music Queue')
                        .setDescription(queueMessage)
                        .addFields(
                            { name: '🔊 Volume', value: `${queue.volume}%`, inline: true },
                            { name: '🔄 Loop', value: queue.loop === 'off' ? 'Off' : queue.loop === 'song' ? 'Song' : 'Queue', inline: true },
                            { name: '⏱️ Status', value: queue.isPlaying ? 'Playing' : 'Paused', inline: true }
                        )
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    break;

                default:
                    await interaction.reply({ content: '❌ Unknown button interaction!', ephemeral: true });
            }
        } catch (error) {
            console.error('Button interaction error:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ An error occurred while processing your request!', ephemeral: true });
            }
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
