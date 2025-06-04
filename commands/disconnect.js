const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnect the bot from the voice channel'),

    async execute(interaction, client) {
        const guild = interaction.guild;
        const member = interaction.member;
        const queue = client.queues.get(guild.id);

        // Check if user has appropriate permissions (admin or same voice channel)
        const botVoiceChannel = guild.members.me.voice.channel;
        const userVoiceChannel = member.voice.channel;

        if (!botVoiceChannel) {
            return interaction.reply('❌ I\'m not connected to a voice channel!');
        }

        // Check if user is admin or in the same voice channel
        if (!member.permissions.has('Administrator') && 
            (!userVoiceChannel || userVoiceChannel.id !== botVoiceChannel.id)) {
            return interaction.reply('❌ You need to be in the same voice channel as the bot or have Administrator permissions!');
        }

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('👋 Disconnected')
            .setDescription(`Disconnected from **${botVoiceChannel.name}**`)
            .addFields(
                { name: '👤 Disconnected by', value: member.user.toString(), inline: true }
            )
            .setTimestamp();

        if (queue) {
            const currentSong = queue.currentSong;
            const queueLength = queue.songs.length;

            if (currentSong) {
                embed.addFields(
                    { name: '🎵 Last Song', value: currentSong.title, inline: true }
                );
            }

            if (queueLength > 0) {
                embed.addFields(
                    { name: '📋 Cleared Songs', value: `${queueLength} song(s)`, inline: true }
                );
            }

            queue.destroy();
            client.queues.delete(guild.id);
        }

        await interaction.reply({ embeds: [embed] });
    }
};
