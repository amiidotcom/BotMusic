# Discord Music Bot

A feature-rich Discord music bot built with Discord.js v14 and @discordjs/voice.

## Features

- 🎵 Play music from YouTube URLs or search queries
- 📋 Queue management (add, skip, pause, resume, stop, clear)
- 🔊 Volume control (0-100%)
- 📱 Now playing information with rich embeds
- 🔄 Loop functionality (single song or entire queue)
- ⏭️ Skip voting system
- 🎛️ Slash commands support
- 🎮 Interactive button controls for music playback
- 🚀 Easy to set up and deploy

## Interactive Controls

The bot now features interactive button controls that appear when music is playing:

- **⏸️ Pause/▶️ Resume** - Toggle playback state
- **⏭️ Skip** - Skip to the next song
- **⏹️ Stop** - Stop music and clear queue
- **🔄 Loop** - Cycle through loop modes (Off → Song → Queue → Off)
- **📋 Queue** - View current queue and status

These buttons provide a user-friendly alternative to slash commands and make controlling music playback more intuitive.

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your bot token:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here (optional, for guild-specific commands)
   ```
4. Start the bot:
   ```bash
   npm start
   ```

## Commands

### Music Commands
- `/play <song>` - Play a song from YouTube URL or search query
- `/skip` - Skip the current song
- `/pause` - Pause the current song
- `/resume` - Resume the paused song
- `/stop` - Stop playing and clear the queue
- `/queue` - Show the current queue
- `/nowplaying` - Show current song information
- `/volume <0-100>` - Set the volume
- `/loop <mode>` - Set loop mode (off/song/queue)
- `/clear` - Clear the queue

### Admin Commands
- `/disconnect` - Disconnect the bot from voice channel

**Note:** Most music controls are also available through interactive buttons that appear when music is playing, providing a more convenient way to control playback without typing commands.

## Requirements

- Node.js 16 or higher
- FFmpeg (included via ffmpeg-static)
- Discord Bot Token

## Installation Notes

Make sure you have the following permissions for your bot:
- Send Messages
- Use Slash Commands
- Connect to Voice Channels
- Speak in Voice Channels
- Use Voice Activity
