import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays help information"),
     execute:  async (interaction:CommandInteraction) =>{
        await interaction.reply("get lost")
    }
}
