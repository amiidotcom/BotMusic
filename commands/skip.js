const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),

    async execute(interaction, client) {
        const guild = interaction.guild;
        const member = interaction.member;
        const queue = client.queues.get(guild.id);

        if (!queue || !queue.currentSong) {
            return interaction.reply('❌ There is no song currently playing!');
        }

        // Check if user is in the same voice channel as the bot
        const botVoiceChannel = guild.members.me.voice.channel;
        const userVoiceChannel = member.voice.channel;

        if (!userVoiceChannel || userVoiceChannel.id !== botVoiceChannel?.id) {
            return interaction.reply('❌ You need to be in the same voice channel as the bot!');
        }

        const skipped = queue.skip();

        if (skipped) {
            const embed = new EmbedBuilder()
                .setColor(0xff6b00)
                .setTitle('⏭️ Song Skipped')
                .setDescription(`Skipped: **${queue.currentSong.title}**`)
                .addFields(
                    { name: '👤 Skipped by', value: member.user.toString(), inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply('❌ Failed to skip the song!');
        }
    }
};
