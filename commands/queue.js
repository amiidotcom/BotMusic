const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current music queue')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number to display')
                .setMinValue(1)
        ),

    async execute(interaction, client) {
        const guild = interaction.guild;
        const queue = client.queues.get(guild.id);

        if (!queue || (!queue.currentSong && queue.songs.length === 0)) {
            return interaction.reply('❌ The music queue is empty!');
        }

        const page = interaction.options.getInteger('page') || 1;
        const itemsPerPage = 10;
        const totalPages = Math.ceil(queue.songs.length / itemsPerPage);

        if (page > totalPages && totalPages > 0) {
            return interaction.reply(`❌ Page ${page} doesn't exist! There are only ${totalPages} pages.`);
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🎵 Music Queue')
            .setTimestamp();

        // Current song
        if (queue.currentSong) {
            embed.addFields({
                name: '🎵 Now Playing',
                value: `[${queue.currentSong.title}](${queue.currentSong.url})\n` +
                       `👤 Requested by: ${queue.currentSong.requestedBy}\n` +
                       `⏱️ Duration: ${queue.currentSong.duration}`,
                inline: false
            });
        }

        // Queue songs
        if (queue.songs.length > 0) {
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, queue.songs.length);
            
            let queueList = '';
            for (let i = startIndex; i < endIndex; i++) {
                const song = queue.songs[i];
                queueList += `\`${i + 1}.\` [${song.title}](${song.url}) - ${song.duration}\n`;
            }

            embed.addFields({
                name: `📋 Up Next (${queue.songs.length} songs)`,
                value: queueList || 'No songs in queue',
                inline: false
            });

            if (totalPages > 1) {
                embed.setFooter({ text: `Page ${page} of ${totalPages}` });
            }
        }

        // Queue info
        const queueInfo = queue.getQueue();
        embed.addFields(
            { name: '🔊 Volume', value: `${queueInfo.volume}%`, inline: true },
            { name: '🔄 Loop', value: queueInfo.loop === 'off' ? 'Off' : queueInfo.loop === 'song' ? 'Song' : 'Queue', inline: true },
            { name: '▶️ Status', value: queueInfo.isPlaying ? 'Playing' : 'Paused', inline: true }
        );

        await interaction.reply({ embeds: [embed] });
    }
};
