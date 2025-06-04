const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Set the music volume (0-100)')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)
        ),

    async execute(interaction, client) {
        const guild = interaction.guild;
        const member = interaction.member;
        const queue = client.queues.get(guild.id);
        const volume = interaction.options.getInteger('level');

        if (!queue) {
            return interaction.reply('❌ There is no music playing!');
        }

        // Check if user is in the same voice channel as the bot
        const botVoiceChannel = guild.members.me.voice.channel;
        const userVoiceChannel = member.voice.channel;

        if (!userVoiceChannel || userVoiceChannel.id !== botVoiceChannel?.id) {
            return interaction.reply('❌ You need to be in the same voice channel as the bot!');
        }

        const oldVolume = queue.volume;
        queue.setVolume(volume);

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🔊 Volume Changed')
            .setDescription(`Volume set to **${volume}%**`)
            .addFields(
                { name: '👤 Changed by', value: member.user.toString(), inline: true },
                { name: '📊 Previous Volume', value: `${oldVolume}%`, inline: true },
                { name: '📊 New Volume', value: `${volume}%`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
