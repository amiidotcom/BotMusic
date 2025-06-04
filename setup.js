const fs = require('fs');
const path = require('path');

console.log('🎵 Discord Music Bot Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    
    // Copy .env.example to .env
    const envExamplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env file created from .env.example');
        console.log('⚠️  Please edit the .env file and add your Discord bot token and client ID');
    } else {
        // Create basic .env file
        const envContent = `# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here

# Optional Configuration
DEFAULT_VOLUME=50
MAX_QUEUE_SIZE=50`;
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Basic .env file created');
        console.log('⚠️  Please edit the .env file and add your Discord bot token and client ID');
    }
} else {
    console.log('✅ .env file already exists');
}

console.log('\n📋 Setup Instructions:');
console.log('1. Edit the .env file with your Discord bot credentials');
console.log('2. Run "npm install" to install dependencies');
console.log('3. Run "node deploy-commands.js" to register slash commands');
console.log('4. Run "npm start" to start the bot');

console.log('\n🔗 How to get Discord bot credentials:');
console.log('1. Go to https://discord.com/developers/applications');
console.log('2. Create a new application');
console.log('3. Go to the "Bot" section and create a bot');
console.log('4. Copy the bot token to DISCORD_TOKEN in .env');
console.log('5. Go to "General Information" and copy Application ID to CLIENT_ID in .env');
console.log('6. (Optional) Add your server ID to GUILD_ID for faster command updates');

console.log('\n🎯 Required Bot Permissions:');
console.log('• Send Messages');
console.log('• Use Slash Commands');
console.log('• Connect to Voice Channels');
console.log('• Speak in Voice Channels');
console.log('• Use Voice Activity');

console.log('\n✨ Setup complete! Follow the instructions above to get started.');
