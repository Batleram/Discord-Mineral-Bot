import { Intents, Client, Message, Collection, Interaction, CommandInteraction } from "discord.js";
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
const path = require('node:path');
require("dotenv").config()

const bot_perms:Intents = new Intents()
bot_perms.add(Intents.FLAGS.GUILD_MESSAGES)
bot_perms.add(Intents.FLAGS.GUILDS)
bot_perms.add(Intents.FLAGS.GUILD_MESSAGE_REACTIONS)

const client:Client = new Client({ intents: bot_perms});


const commands = []
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON())
}


client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', async (message:Message<boolean>) => {
    if (message.author.bot) return 
    if (message.content.includes("@here") || message.content.includes("@everyone") || message.type == "REPLY") return 
})

client.on("interactionCreate", async (interaction: CommandInteraction) =>{
    const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'dude you broke me ', ephemeral: true });
	}
})

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENTID, '705192192976748644'),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
console.log(commands)


client.login(process.env.TOKEN);

