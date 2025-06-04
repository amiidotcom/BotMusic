const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const YouTube = require('youtube-sr').default;
const { getUserVoiceChannel, checkVoicePermissions } = require('../utils');
const MusicQueue = require('../MusicQueue');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for songs and choose which to play')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search query')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('results')
                .setDescription('Number of results to show (1-10)')
                .setMinValue(1)
                .setMaxValue(10)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        const query = interaction.options.getString('query');
        const resultCount = interaction.options.getInteger('results') || 5;
        const member = interaction.member;
        const guild = interaction.guild;

        // Check if user is in a voice channel
        const voiceChannel = getUserVoiceChannel(member);
        if (!voiceChannel) {
            return interaction.editReply('❌ You need to be in a voice channel to search for music!');
        }

        // Check bot permissions
        const botMember = guild.members.me;
        const permissionCheck = checkVoicePermissions(voiceChannel, botMember);
        
        if (!permissionCheck.hasPermissions) {
            let missingPerms = [];
            if (permissionCheck.missing.connect) missingPerms.push('Connect');
            if (permissionCheck.missing.speak) missingPerms.push('Speak');
            if (permissionCheck.missing.useVAD) missingPerms.push('Use Voice Activity');
            
            return interaction.editReply(`❌ I don't have the necessary permissions in ${voiceChannel.name}!\nMissing: ${missingPerms.join(', ')}`);
        }

        try {
            // Search YouTube
            const searchResults = await YouTube.search(query, { limit: resultCount, type: 'video' });
            
            if (searchResults.length === 0) {
                return interaction.editReply('❌ No results found for your search!');
            }

            // Create search results embed
            let description = '';
            searchResults.forEach((video, index) => {
                description += `\`${index + 1}.\` [${video.title}](${video.url})\n`;
                description += `    👤 ${video.channel?.name || 'Unknown'} • ⏱️ ${video.durationFormatted || 'Unknown'}\n\n`;
            });

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('🔍 Search Results')
                .setDescription(description)
                .setFooter({ text: 'Reply with the number of the song you want to play, or "cancel" to cancel.' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Create message collector for user response
            const filter = (response) => {
                return response.author.id === interaction.user.id;
            };

            const collector = interaction.channel.createMessageCollector({ 
                filter, 
                time: 30000, // 30 seconds
                max: 1 
            });

            collector.on('collect', async (message) => {
                const choice = message.content.toLowerCase();

                if (choice === 'cancel') {
                    await message.reply('❌ Search cancelled.');
                    return;
                }

                const songIndex = parseInt(choice) - 1;
                
                if (isNaN(songIndex) || songIndex < 0 || songIndex >= searchResults.length) {
                    await message.reply('❌ Invalid choice! Please enter a number from the search results or "cancel".');
                    return;
                }

                const selectedVideo = searchResults[songIndex];

                // Check if queue exists, create if not
                let queue = client.queues.get(guild.id);
                if (!queue) {
                    queue = new MusicQueue(guild.id, voiceChannel, interaction.channel);
                    
                    const connected = await queue.connect();
                    if (!connected) {
                        await message.reply('❌ Failed to connect to the voice channel!');
                        return;
                    }
                    
                    client.queues.set(guild.id, queue);
                }

                // Check if bot is in the same voice channel
                const connection = getVoiceConnection(guild.id);
                if (connection && connection.joinConfig.channelId !== voiceChannel.id) {
                    await message.reply('❌ I\'m already playing music in a different voice channel!');
                    return;
                }

                // Add song to queue
                const song = {
                    title: selectedVideo.title,
                    url: selectedVideo.url,
                    duration: selectedVideo.durationFormatted || 'Unknown',
                    thumbnail: selectedVideo.thumbnail?.url,
                    uploader: selectedVideo.channel?.name || 'Unknown',
                    requestedBy: member.user
                };

                const position = await queue.addSong(song);

                // Create response embed
                const responseEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('✅ Song Added to Queue')
                    .setDescription(`[${song.title}](${song.url})`)
                    .addFields(
                        { name: '👤 Requested by', value: member.user.toString(), inline: true },
                        { name: '⏱️ Duration', value: song.duration, inline: true },
                        { name: '📊 Position in Queue', value: position.toString(), inline: true }
                    )
                    .setThumbnail(song.thumbnail)
                    .setTimestamp();

                if (position === 1 && !queue.currentSong) {
                    responseEmbed.setTitle('🎵 Now Playing');
                    responseEmbed.setColor(0xff6b00);
                }

                await message.reply({ embeds: [responseEmbed] });
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    interaction.followUp('⏰ Search timed out. Please use the command again to search for music.');
                }
            });

        } catch (error) {
            console.error('Error searching YouTube:', error);
            await interaction.editReply('❌ An error occurred while searching for music.');
        }
    }
};
