const ytdl = require('@distube/ytdl-core');
const YouTube = require('youtube-sr').default;

/**
 * Search for a YouTube video or validate a URL
 * @param {string} query - Search query or YouTube URL
 * @returns {Object|null} Video information or null if not found
 */
async function getVideoInfo(query) {
    try {
        // Check if it's a valid YouTube URL
        if (ytdl.validateURL(query)) {
            const info = await ytdl.getInfo(query, {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            });
            return {
                title: info.videoDetails.title,
                url: info.videoDetails.video_url,
                duration: formatDuration(parseInt(info.videoDetails.lengthSeconds)),
                thumbnail: info.videoDetails.thumbnails[0]?.url,
                uploader: info.videoDetails.author.name
            };
        }

        // Search YouTube for the query
        const searchResults = await YouTube.search(query, { limit: 1, type: 'video' });
        
        if (searchResults.length === 0) {
            return null;
        }

        const video = searchResults[0];
        return {
            title: video.title,
            url: video.url,
            duration: video.durationFormatted || 'Unknown',
            thumbnail: video.thumbnail?.url,
            uploader: video.channel?.name || 'Unknown'
        };

    } catch (error) {
        console.error('Error getting video info:', error);
        return null;
    }
}

/**
 * Format duration from seconds to MM:SS or HH:MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
    if (isNaN(seconds) || seconds < 0) return 'Unknown';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

/**
 * Check if user is in a voice channel
 * @param {GuildMember} member - Discord guild member
 * @returns {VoiceChannel|null} Voice channel or null
 */
function getUserVoiceChannel(member) {
    return member.voice.channel;
}

/**
 * Check if bot has necessary permissions in voice channel
 * @param {VoiceChannel} voiceChannel - Voice channel to check
 * @param {GuildMember} botMember - Bot's guild member
 * @returns {Object} Permission check result
 */
function checkVoicePermissions(voiceChannel, botMember) {
    const permissions = voiceChannel.permissionsFor(botMember);
    
    const hasConnect = permissions.has('Connect');
    const hasSpeak = permissions.has('Speak');
    const hasUseVAD = permissions.has('UseVAD');

    return {
        hasPermissions: hasConnect && hasSpeak && hasUseVAD,
        missing: {
            connect: !hasConnect,
            speak: !hasSpeak,
            useVAD: !hasUseVAD
        }
    };
}

/**
 * Validate YouTube URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid YouTube URL
 */
function isValidYouTubeURL(url) {
    return ytdl.validateURL(url);
}

/**
 * Create a progress bar for queue display
 * @param {number} current - Current position
 * @param {number} total - Total items
 * @param {number} length - Length of progress bar
 * @returns {string} Progress bar string
 */
function createProgressBar(current, total, length = 20) {
    if (total === 0) return '▱'.repeat(length);
    
    const progress = Math.round((current / total) * length);
    const filled = '▰'.repeat(progress);
    const empty = '▱'.repeat(length - progress);
    
    return filled + empty;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

module.exports = {
    getVideoInfo,
    formatDuration,
    getUserVoiceChannel,
    checkVoicePermissions,
    isValidYouTubeURL,
    createProgressBar,
    truncateText
};
