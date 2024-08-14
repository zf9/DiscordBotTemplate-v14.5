const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const Config = require('./Config/MainConfig.json')

const askQuestion = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
};

(async () => {
    try {
        const guildId = await askQuestion('Enter your Discord server ID: ');

        const commands = [];
        const slashCommandsPath = path.join(__dirname, 'SlashCommands');
        const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

        for (const file of slashCommandFiles) {
            const command = require(path.join(slashCommandsPath, file));
            commands.push(command.data.toJSON());
        }

        const rest = new REST({ version: '10' }).setToken(Config.DiscordToken);

        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(Config.DiscordClientID, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
})();
