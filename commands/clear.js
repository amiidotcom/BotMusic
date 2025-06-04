const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear the music queue'),

    async execute(interaction, client) {
        const guild = interaction.guild;
        const member = interaction.member;
        const queue = client.queues.get(guild.id);

        if (!queue) {
            return interaction.reply('❌ There is no music queue!');
        }

        // Check if user is in the same voice channel as the bot
        const botVoiceChannel = guild.members.me.voice.channel;
        const userVoiceChannel = member.voice.channel;

        if (!userVoiceChannel || userVoiceChannel.id !== botVoiceChannel?.id) {
            return interaction.reply('❌ You need to be in the same voice channel as the bot!');
        }

        if (queue.songs.length === 0) {
            return interaction.reply('❌ The queue is already empty!');
        }

        const clearedCount = queue.songs.length;
        queue.clear();

        const embed = new EmbedBuilder()
            .setColor(0xff6b00)
            .setTitle('🗑️ Queue Cleared')
            .setDescription(`Removed **${clearedCount}** song(s) from the queue`)
            .addFields(
                { name: '👤 Cleared by', value: member.user.toString(), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
