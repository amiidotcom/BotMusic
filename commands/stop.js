const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop playing music and clear the queue'),

    async execute(interaction, client) {
        const guild = interaction.guild;
        const member = interaction.member;
        const queue = client.queues.get(guild.id);

        if (!queue) {
            return interaction.reply('❌ There is no music playing!');
        }

        // Check if user is in the same voice channel as the bot
        const botVoiceChannel = guild.members.me.voice.channel;
        const userVoiceChannel = member.voice.channel;

        if (!userVoiceChannel || userVoiceChannel.id !== botVoiceChannel?.id) {
            return interaction.reply('❌ You need to be in the same voice channel as the bot!');
        }

        const currentSong = queue.currentSong;
        const queueLength = queue.songs.length;

        queue.stop();

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('⏹️ Music Stopped')
            .setDescription('Music has been stopped and the queue has been cleared.')
            .addFields(
                { name: '👤 Stopped by', value: member.user.toString(), inline: true }
            )
            .setTimestamp();

        if (currentSong) {
            embed.addFields(
                { name: '🎵 Last Song', value: currentSong.title, inline: true }
            );
        }

        if (queueLength > 0) {
            embed.addFields(
                { name: '📋 Cleared Songs', value: `${queueLength} song(s) removed`, inline: true }
            );
        }

        await interaction.reply({ embeds: [embed] });
    }
};
