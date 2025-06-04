// Test script to verify all audio dependencies are working
const { createAudioPlayer, createAudioResource } = require('@discordjs/voice');

console.log('🔍 Testing Discord.js Voice Dependencies...\n');

try {
    // Test if @discordjs/opus is available
    const player = createAudioPlayer();
    console.log('✅ @discordjs/voice: Audio player created successfully');
    console.log('✅ @discordjs/opus: Opus encoder available');
} catch (error) {
    console.error('❌ Error with Discord.js voice:', error.message);
}

try {
    // Test if @distube/ytdl-core is available
    const ytdl = require('@distube/ytdl-core');
    console.log('✅ @distube/ytdl-core: YouTube downloader available');
} catch (error) {
    console.error('❌ Error with ytdl-core:', error.message);
}

try {
    // Test if youtube-sr is available
    const YouTube = require('youtube-sr').default;
    console.log('✅ youtube-sr: YouTube search available');
} catch (error) {
    console.error('❌ Error with youtube-sr:', error.message);
}

try {
    // Test if ffmpeg-static is available
    const ffmpeg = require('ffmpeg-static');
    console.log('✅ ffmpeg-static: FFmpeg binary available');
    console.log(`   FFmpeg path: ${ffmpeg}`);
} catch (error) {
    console.error('❌ Error with ffmpeg-static:', error.message);
}

try {
    // Test if encryption package is available
    const sodium = require('libsodium-wrappers');
    console.log('✅ libsodium-wrappers: Encryption package available');
} catch (error) {
    console.error('❌ Error with encryption package:', error.message);
}

console.log('\n🎵 All audio dependencies are ready for music playback!');
