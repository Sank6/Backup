require('dotenv').config();

const express = require('express');const app = express();const listener = app.listen("80", function() {});
app.get('/api/install/:guildid', async(req, res)=> {
  let guild = client.guilds.get(req.params.guildid);
  if ((guild.roles.size - 1) - guild.me.roles.find(x => x.managed).rawPosition !== 0) 
    return res.json(`Error: Please make sure the role called ${message.guild.me.roles.find(x => x.managed).name} is above all the others in Server Settings > Roles and try again.`)
  let backupid = req.query.id;
  let r = await client.tasks.find(x => x.name === "install").run(guild, backupid);
  res.send(r);
});
app.get('/api/backup/:guildid', async(req, res)=> {
  let guild = client.guilds.get(req.params.guildid);
  let r = await client.tasks.find(x => x.name === "backup").run(guild);
  res.send(r);
});

const { Client } = require('klasa');
const client = new Client({
  commandEditing: true,
  prefix: "b!",
  disabledCorePieces: ["commands"],
  providers: { default: "mongodb" },
  gateways: {
    clientStorage: {
      schema: Client.defaultClientSchema
      .add("backups", "string", {default: "[]"})
    }
  }
});

client.on('klasaReady', () => {
  client.schedule.create('backup', '0 0 * * 0');
  client.user.setPresence({ activity: { name: 'for b!help', type: 'WATCHING' }})
});

client.login();
