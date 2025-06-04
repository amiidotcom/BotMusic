const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available music commands'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🎵 Music Bot Commands')
            .setDescription('Here are all the available music commands:')
            .addFields(
                {
                    name: '🎶 Music Playback',
                    value: '`/play <song>` - Play a song from YouTube URL or search\n' +
                           '`/search <query>` - Search and choose from multiple results\n' +
                           '`/pause` - Pause the current song\n' +
                           '`/resume` - Resume the paused song\n' +
                           '`/skip` - Skip the current song\n' +
                           '`/stop` - Stop playing and clear queue',
                    inline: false
                },
                {
                    name: '📋 Queue Management',
                    value: '`/queue [page]` - Show the music queue\n' +
                           '`/clear` - Clear the entire queue\n' +
                           '`/nowplaying` - Show current song info',
                    inline: false
                },
                {
                    name: '⚙️ Settings',
                    value: '`/volume <0-100>` - Set the music volume\n' +
                           '`/loop <mode>` - Set loop mode (off/song/queue)',
                    inline: false
                },
                {
                    name: '🔧 Bot Control',
                    value: '`/disconnect` - Disconnect bot from voice channel\n' +
                           '`/help` - Show this help message',
                    inline: false
                },
                {
                    name: '📝 Notes',
                    value: '• You must be in a voice channel to use music commands\n' +
                           '• The bot will auto-disconnect after 5 minutes of inactivity\n' +
                           '• Use YouTube URLs or search terms with `/play`\n' +
                           '• Admin permissions allow using `/disconnect` from anywhere',
                    inline: false
                }
            )
            .setFooter({ 
                text: 'Discord Music Bot | Powered by YouTube', 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
