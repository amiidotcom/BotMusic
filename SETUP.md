# 🎵 Discord Music Bot - Quick Start Guide

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
# Run the setup script
npm run setup
```

Then edit the `.env` file with your Discord bot credentials:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here (optional)
```

### 3. Get Discord Bot Credentials

1. **Go to Discord Developer Portal**: https://discord.com/developers/applications
2. **Create New Application**: Click "New Application" and give it a name
3. **Create Bot**:
   - Go to "Bot" section in the left sidebar
   - Click "Add Bot"
   - Copy the **Token** and paste it as `DISCORD_TOKEN` in `.env`
4. **Get Application ID**:
   - Go to "General Information" section
   - Copy the **Application ID** and paste it as `CLIENT_ID` in `.env`
5. **Get Server ID** (Optional but recommended):
   - Right-click your Discord server
   - Click "Copy Server ID"
   - Paste it as `GUILD_ID` in `.env`

### 4. Set Bot Permissions

When inviting your bot to a server, make sure it has these permissions:
- ✅ Send Messages
- ✅ Use Slash Commands  
- ✅ Connect to Voice Channels
- ✅ Speak in Voice Channels
- ✅ Use Voice Activity

**Invite URL Format:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=3148800&scope=bot%20applications.commands
```

### 5. Deploy Commands
```bash
npm run deploy
```

### 6. Start the Bot
```bash
npm start
```

## 🎮 Available Commands

| Command | Description |
|---------|-------------|
| `/play <song>` | Play music from YouTube URL or search |
| `/search <query>` | Search and choose from multiple results |
| `/pause` | Pause current song |
| `/resume` | Resume paused song |
| `/skip` | Skip current song |
| `/stop` | Stop and clear queue |
| `/queue` | Show music queue |
| `/volume <0-100>` | Set volume |
| `/loop <mode>` | Set loop mode (off/song/queue) |
| `/clear` | Clear queue |
| `/nowplaying` | Show current song |
| `/disconnect` | Disconnect from voice |
| `/help` | Show help message |

## 🔧 Troubleshooting

### Bot doesn't respond to commands
- Make sure you deployed commands with `npm run deploy`
- Check that the bot has "Use Slash Commands" permission
- Verify the bot token is correct in `.env`

### Can't play music
- Ensure the bot has voice permissions in your server
- Check that you're in a voice channel when using music commands
- Make sure the bot can connect to and speak in voice channels

### Installation errors
- Make sure you have Node.js 16+ installed
- Try deleting `node_modules` and running `npm install` again
- On Windows, you might need Visual Studio Build Tools for some dependencies

## 🌟 Features

- 🎵 Play music from YouTube (URLs or search)
- 📋 Queue management with multiple songs
- 🔊 Volume control (0-100%)
- 🔄 Loop modes (off/song/queue)
- ⏭️ Skip, pause, resume controls
- 🔍 Interactive search with results
- 📱 Rich embeds with song information
- 🚀 Auto-disconnect when inactive
- 👥 Voice channel validation
- 🛡️ Permission checking

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure all permissions are set correctly
3. Verify your `.env` file configuration
4. Check the console for error messages

Enjoy your Discord Music Bot! 🎶
