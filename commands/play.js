const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const MusicQueue = require('../MusicQueue');
const { getVideoInfo, getUserVoiceChannel, checkVoicePermissions } = require('../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from YouTube URL or search query')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('YouTube URL or search query')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        const query = interaction.options.getString('song');
        const member = interaction.member;
        const guild = interaction.guild;

        // Check if user is in a voice channel
        const voiceChannel = getUserVoiceChannel(member);
        if (!voiceChannel) {
            return interaction.editReply('❌ You need to be in a voice channel to play music!');
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

        // Get video information
        const videoInfo = await getVideoInfo(query);
        if (!videoInfo) {
            return interaction.editReply('❌ Could not find any results for your search!');
        }

        // Check if queue exists, create if not
        let queue = client.queues.get(guild.id);
        if (!queue) {
            queue = new MusicQueue(guild.id, voiceChannel, interaction.channel);
            
            const connected = await queue.connect();
            if (!connected) {
                return interaction.editReply('❌ Failed to connect to the voice channel!');
            }
            
            client.queues.set(guild.id, queue);
        }

        // Check if bot is in the same voice channel
        const connection = getVoiceConnection(guild.id);
        if (connection && connection.joinConfig.channelId !== voiceChannel.id) {
            return interaction.editReply('❌ I\'m already playing music in a different voice channel!');
        }

        // Add song to queue
        const song = {
            ...videoInfo,
            requestedBy: member.user
        };

        const position = await queue.addSong(song);

        // Create response embed
        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('✅ Song Added to Queue')
            .setDescription(`[${videoInfo.title}](${videoInfo.url})`)
            .addFields(
                { name: '👤 Requested by', value: member.user.toString(), inline: true },
                { name: '⏱️ Duration', value: videoInfo.duration, inline: true },
                { name: '📊 Position in Queue', value: position.toString(), inline: true }
            )
            .setThumbnail(videoInfo.thumbnail)
            .setTimestamp();

        if (position === 1 && !queue.currentSong) {
            embed.setTitle('🎵 Now Playing');
            embed.setColor(0xff6b00);
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
