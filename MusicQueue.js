const { 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    VoiceConnectionStatus,
    getVoiceConnection,
    joinVoiceChannel
} = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class MusicQueue {
    constructor(guildId, voiceChannel, textChannel) {
        this.guildId = guildId;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
        this.songs = [];
        this.currentSong = null;        this.isPlaying = false;
        this.volume = parseInt(process.env.DEFAULT_VOLUME) || 50;
        this.loop = 'off'; // 'off', 'song', 'queue'
        this.lastMessage = null; // Store reference to the last "Now Playing" message
        
        this.player = createAudioPlayer();
        this.connection = null;
        
        this.setupEventListeners();
    }    setupEventListeners() {
        // Player state change events
        this.player.on(AudioPlayerStatus.Playing, () => {
            this.isPlaying = true;
            this.updateControlButtons(); // Update buttons when playing
        });

        this.player.on(AudioPlayerStatus.Paused, () => {
            this.isPlaying = false;
            this.updateControlButtons(); // Update buttons when paused
        });

        this.player.on(AudioPlayerStatus.Idle, () => {
            this.isPlaying = false;
            this.handleSongEnd();
        });

        this.player.on('error', error => {
            console.error('Audio player error:', error);
            this.textChannel.send('❌ An error occurred while playing the song.');
            this.handleSongEnd();
        });
    }

    async connect() {
        try {
            this.connection = joinVoiceChannel({
                channelId: this.voiceChannel.id,
                guildId: this.guildId,
                adapterCreator: this.voiceChannel.guild.voiceAdapterCreator,
            });

            this.connection.subscribe(this.player);

            this.connection.on(VoiceConnectionStatus.Disconnected, () => {
                this.destroy();
            });

            return true;
        } catch (error) {
            console.error('Error connecting to voice channel:', error);
            return false;
        }
    }

    async addSong(song) {
        this.songs.push(song);
        
        if (!this.isPlaying && !this.currentSong) {
            this.playNext();
        }
        
        return this.songs.length;
    }

    async playNext() {
        if (this.songs.length === 0) {
            this.currentSong = null;
            
            // Auto-disconnect after 5 minutes of inactivity
            setTimeout(() => {
                if (!this.isPlaying && this.songs.length === 0) {
                    this.textChannel.send('🔇 Disconnecting due to inactivity.');
                    this.destroy();
                }
            }, 300000); // 5 minutes
            
            return;
        }

        const song = this.songs.shift();
        this.currentSong = song;        try {
            const stream = ytdl(song.url, {
                filter: 'audioonly',
                highWaterMark: 1 << 25,
                quality: 'highestaudio',
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            });            const resource = createAudioResource(stream, {
                inlineVolume: true
            });

            resource.volume.setVolume(this.volume / 100);
            this.player.play(resource);
            
            // Send now playing embed
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('🎵 Now Playing')
                .setDescription(`[${song.title}](${song.url})`)
                .addFields(
                    { name: '👤 Requested by', value: song.requestedBy.toString(), inline: true },
                    { name: '⏱️ Duration', value: song.duration, inline: true },
                    { name: '🔊 Volume', value: `${this.volume}%`, inline: true }
                )
                .setThumbnail(song.thumbnail)
                .setTimestamp();            // Create control buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('music_pause_resume')
                        .setLabel('⏸️ Pause')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_skip')
                        .setLabel('⏭️ Skip')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('music_stop')
                        .setLabel('⏹️ Stop')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('music_loop')
                        .setLabel(`🔄 ${this.loop === 'off' ? 'Loop Off' : this.loop === 'song' ? 'Loop Song' : 'Loop Queue'}`)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('music_queue')
                        .setLabel('📋 Queue')
                        .setStyle(ButtonStyle.Secondary)                );

            this.lastMessage = await this.textChannel.send({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Error playing song:', error);
            this.textChannel.send(`❌ Error playing song: ${song.title}`);
            this.handleSongEnd();
        }
    }

    handleSongEnd() {
        if (this.loop === 'song' && this.currentSong) {
            // Add current song back to the beginning of queue for loop
            this.songs.unshift(this.currentSong);
        } else if (this.loop === 'queue' && this.currentSong) {
            // Add current song to the end of queue for queue loop
            this.songs.push(this.currentSong);
        }

        this.playNext();
    }

    skip() {
        if (this.isPlaying) {
            this.player.stop();
            return true;
        }
        return false;
    }    pause() {
        if (this.isPlaying) {
            this.player.pause();
            return true;
        }
        return false;
    }

    resume() {
        if (!this.isPlaying) {
            this.player.unpause();
            return true;
        }
        return false;
    }

    stop() {
        this.songs = [];
        this.currentSong = null;
        this.player.stop();
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(100, volume));
        if (this.player.state.resource && this.player.state.resource.volume) {
            this.player.state.resource.volume.setVolume(this.volume / 100);
        }
    }

    setLoop(mode) {
        const validModes = ['off', 'song', 'queue'];
        if (validModes.includes(mode)) {
            this.loop = mode;
            return true;
        }
        return false;
    }

    getQueue() {
        return {
            current: this.currentSong,
            upcoming: this.songs,
            isPlaying: this.isPlaying,
            volume: this.volume,
            loop: this.loop
        };
    }

    clear() {
        this.songs = [];
    }    destroy() {
        this.stop();
        if (this.connection) {
            this.connection.destroy();
        }
    }

    // Create control buttons based on current state
    createControlButtons() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('music_pause_resume')
                    .setLabel(this.isPlaying ? '⏸️ Pause' : '▶️ Resume')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(!this.currentSong),
                new ButtonBuilder()
                    .setCustomId('music_skip')
                    .setLabel('⏭️ Skip')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(!this.currentSong),
                new ButtonBuilder()
                    .setCustomId('music_stop')
                    .setLabel('⏹️ Stop')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!this.currentSong && this.songs.length === 0),
                new ButtonBuilder()
                    .setCustomId('music_loop')
                    .setLabel(`🔄 ${this.loop === 'off' ? 'Loop Off' : this.loop === 'song' ? 'Loop Song' : 'Loop Queue'}`)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('music_queue')
                    .setLabel('📋 Queue')
                    .setStyle(ButtonStyle.Secondary)
            );
    }

    async updateControlButtons() {
        if (!this.currentSong || !this.lastMessage) return;

        try {
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('🎵 Now Playing')
                .setDescription(`[${this.currentSong.title}](${this.currentSong.url})`)
                .addFields(
                    { name: '👤 Requested by', value: this.currentSong.requestedBy.toString(), inline: true },
                    { name: '⏱️ Duration', value: this.currentSong.duration, inline: true },
                    { name: '🔊 Volume', value: `${this.volume}%`, inline: true }
                )
                .setThumbnail(this.currentSong.thumbnail)
                .setTimestamp();

            const row = this.createControlButtons();
            await this.lastMessage.edit({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Error updating control buttons:', error);
        }
    }
}

module.exports = MusicQueue;
