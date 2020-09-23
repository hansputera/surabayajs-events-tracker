const Discord = require("discord.js");
const moment = require("moment");
const axios = require("axios");
const Enmap = require("enmap");
const db = new Enmap({ name: "db" });


const app = require("express")();
app.get("/", (req, res) => res.sendStatus(200));

app.listen(3000);

const bot = new Discord.Client({
  disableMentions: "everyone"
});

bot.on("ready", () => {
  console.log("Logged in as", bot.user.tag);
  bot.user.setActivity("SurabayaJS Events", {
    type:"PLAYING"
  });
});

async function checkEvent() {
  db.ensure("event", []); 
  const data = await axios.get("https://surabayajs.org/api/events");
  let resultExp;
  for (let i = 0; i < data.data.length; i++) {
    data.data[i].startingDate = moment(data.data[i].startingDate).locale("id").fromNow();
    resultExp = data.data;
    console.log(resultExp);
    resultExp = resultExp.filter(obj => !obj.startingDate.includes("lalu"));
    for (var x = 0; x < resultExp.length; x++) {
    db.push("event", resultExp[x]);
    }
  }
  
  console.log(`Total Events yang aktif: ${resultExp.length}`);
  return resultExp;
}

setInterval(async () => {
  const data = await checkEvent();
  db.ensure("lastSent", {});
  if (db.get("lastSent") === data[0].title) return;
  const embed = new Discord.MessageEmbed()
  .setTitle(data[0].title)
  .setDescription(data[0].description)
  .addField("Slug", data[0].slug)
  .addField("Category", data[0].category)
  .addField("Location / URL", `- ${data[0].location} / ${data[0].url}`)
  .addField("Quota", data[0].quota)
  .addField("When?:", data[0].startingDate)
  .setColor("RANDOM");
  bot.channels.cache.get("758229575653654528").send(embed);
  db.set("lastSent", data[0].title);
}, 60000);



bot.login(process.env.TOKEN);