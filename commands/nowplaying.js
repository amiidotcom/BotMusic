const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show information about the currently playing song'),

    async execute(interaction, client) {
        const guild = interaction.guild;
        const queue = client.queues.get(guild.id);

        if (!queue || !queue.currentSong) {
            return interaction.reply('❌ There is no song currently playing!');
        }

        const song = queue.currentSong;
        const queueInfo = queue.getQueue();

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🎵 Now Playing')
            .setDescription(`[${song.title}](${song.url})`)
            .addFields(
                { name: '👤 Requested by', value: song.requestedBy.toString(), inline: true },
                { name: '⏱️ Duration', value: song.duration, inline: true },
                { name: '🔊 Volume', value: `${queueInfo.volume}%`, inline: true },
                { name: '📺 Uploader', value: song.uploader || 'Unknown', inline: true },
                { name: '🔄 Loop Mode', value: queueInfo.loop === 'off' ? 'Off' : queueInfo.loop === 'song' ? 'Song' : 'Queue', inline: true },
                { name: '▶️ Status', value: queueInfo.isPlaying ? 'Playing' : 'Paused', inline: true }
            )
            .setThumbnail(song.thumbnail)
            .setTimestamp();

        // Add queue position info if there are more songs
        if (queue.songs.length > 0) {
            embed.addFields({
                name: '📋 Queue Info',
                value: `${queue.songs.length} song(s) in queue`,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
