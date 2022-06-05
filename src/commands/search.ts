import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { parse } from "node-html-parser"
import { CommandInteraction, MessageEmbed } from "discord.js";
import { getMineralInfoPage } from "../helpers";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search a mineral")
        .addStringOption((option: SlashCommandStringOption) => {
            return option.setName("name")
                .setDescription("Name of the mineral to search for")
                .setRequired(true);
        }),
    execute: async (interaction: CommandInteraction) => {
        const name = interaction.options.get("name").value.toString()
        if (!name.match(/^[a-zA-Z\s]+$/m)) {
            interaction.reply("Sneaky bastard, don't even try! \n\n**LETTERS ONLY!**")
            return
        }
        await interaction.deferReply()

        let results = await getSearchResults({ query: name })

        console.log(`User ${interaction.user.username} Searched for: ${name}`)
        console.log(results.map(res => res.text))

        if (results.length == 0)
            return interaction.reply("No results, sorry ¯\\_(ツ)_/¯")

        let exact_matches = results.filter(res => res.text.toLowerCase() == name.toLowerCase())
        if (exact_matches.length > 0) {
            let page = await getMineralInfoPage(exact_matches[0])
            let quick_info: any = {};
            page.querySelectorAll("#introdata > div:not(.twocol)").map(el => quick_info[el.firstChild.text] = el.lastChild.text)
            quick_info.Description = page.querySelector("#collapse1 div.padder4").textContent.substring(0,1024)
            interaction.editReply({ embeds: [embedFromMineral(quick_info, name)] })
        }

    }
}

async function getSearchResults({ query, full = false }): Promise<any> {
    let search_res = await fetch(`https://www.mindat.org/search.php?search=${query.replace(" ", "%20")}&nrd=1`, { method: "get", redirect: "follow" })
    let page = parse(await search_res.text())
    let results = Array.from(
        page.querySelectorAll("div.newminsearchresults div a ") // get all the links in the results
    )
    if (!full)
        return results
    return results.filter(el => el.querySelectorAll("i").length == 0) // only get the ones without italic as they are the only real ones
}


function embedFromMineral(mineral_info, name): MessageEmbed {
    const embed = new MessageEmbed();
    Object.keys(mineral_info).map(key => embed.addField(
        key,
        mineral_info[key]
    ))
    embed.setTitle(name)
    return embed

}
