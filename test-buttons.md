# Button Interaction Test Guide

## Testing the Interactive Button Controls

To test the new button functionality, follow these steps:

### Prerequisites
1. The bot should be online and running
2. You need to be in a voice channel
3. The bot needs permission to join voice channels and play audio

### Test Steps

1. **Join a voice channel** in your Discord server

2. **Use the `/play` command** to start playing music:
   ```
   /play song: never gonna give you up
   ```

3. **Verify the buttons appear** - You should see 5 buttons below the "Now Playing" embed:
   - ⏸️ Pause
   - ⏭️ Skip  
   - ⏹️ Stop
   - 🔄 Loop Off
   - 📋 Queue

4. **Test each button**:
   - Click **⏸️ Pause** - Should pause the music and show "⏸️ Music paused!"
   - Click **⏸️ Pause** again (now shows ▶️ Resume) - Should resume and show "▶️ Music resumed!"
   - Click **📋 Queue** - Should show queue information in an ephemeral message
   - Click **🔄 Loop Off** - Should cycle to "🔂 Loop mode: Song"
   - Click **🔄 Loop** again - Should cycle to "🔁 Loop mode: Queue"  
   - Click **🔄 Loop** again - Should cycle to "➡️ Loop mode: Off"
   - Click **⏭️ Skip** - Should skip to next song (or stop if no queue)
   - Click **⏹️ Stop** - Should stop music and clear queue

### Expected Behavior

- All button interactions should be **ephemeral** (only visible to the user who clicked)
- Buttons should only work for users in the same voice channel as the bot
- Users not in a voice channel should get an error message
- Each button should provide appropriate feedback messages

### Troubleshooting

If buttons don't appear:
1. Check that the bot is running the latest code
2. Verify the bot has "Use Slash Commands" permission
3. Check console for any error messages

If buttons don't respond:
1. Check that the interaction handler is properly registered
2. Verify no errors in the console when clicking buttons
3. Ensure the user is in the same voice channel as the bot
