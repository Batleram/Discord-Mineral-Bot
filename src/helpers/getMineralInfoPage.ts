import parse from "node-html-parser"

export async function getMineralInfoPage(mineral){
    let page_res = await fetch(`https://www.mindat.org/${mineral.getAttribute("href")}`, {method: "GET", redirect:"follow"})
    console.log(`https://www.mindat.org/${mineral.getAttribute("href")}`)
    let page = parse(await page_res.text());
    return page


}
