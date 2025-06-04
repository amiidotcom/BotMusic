const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

// Load all command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
        console.log(`⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

        // Choose deployment method based on environment variables
        let data;
        
        if (process.env.GUILD_ID) {
            // Deploy commands to a specific guild (faster for development)
            console.log('📍 Deploying commands to specific guild...');
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
        } else {
            // Deploy commands globally (takes up to 1 hour to update)
            console.log('🌍 Deploying commands globally...');
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
        }

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
        
        // List deployed commands
        console.log('\n📋 Deployed commands:');
        data.forEach(command => {
            console.log(`   • /${command.name} - ${command.description}`);
        });

    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
