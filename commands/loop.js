const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set the loop mode')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Current Song', value: 'song' },
                    { name: 'Entire Queue', value: 'queue' }
                )
        ),

    async execute(interaction, client) {
        const guild = interaction.guild;
        const member = interaction.member;
        const queue = client.queues.get(guild.id);
        const mode = interaction.options.getString('mode');

        if (!queue) {
            return interaction.reply('❌ There is no music playing!');
        }

        // Check if user is in the same voice channel as the bot
        const botVoiceChannel = guild.members.me.voice.channel;
        const userVoiceChannel = member.voice.channel;

        if (!userVoiceChannel || userVoiceChannel.id !== botVoiceChannel?.id) {
            return interaction.reply('❌ You need to be in the same voice channel as the bot!');
        }

        const oldMode = queue.loop;
        const success = queue.setLoop(mode);

        if (!success) {
            return interaction.reply('❌ Invalid loop mode!');
        }

        const modeNames = {
            'off': 'Off',
            'song': 'Current Song',
            'queue': 'Entire Queue'
        };

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🔄 Loop Mode Changed')
            .setDescription(`Loop mode set to **${modeNames[mode]}**`)
            .addFields(
                { name: '👤 Changed by', value: member.user.toString(), inline: true },
                { name: '🔄 Previous Mode', value: modeNames[oldMode], inline: true },
                { name: '🔄 New Mode', value: modeNames[mode], inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
