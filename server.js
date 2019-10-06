require("dotenv").config();

const express = require("express");
const btoa = require("btoa");
const fetch = require("node-fetch");
const Discord = require("discord.js")
const {
  Client
} = require("klasa");

const {
  CLIENT_ID,
  CLIENT_SECRET,
  prefix,
  domain,
  invite
} = process.env;

// Express config
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.listen("80");

// Express endpoints
app.get("/discord", (req, res) => {
  res.redirect(invite);
});

app.get("/api/login", (req, res) => {
  res.redirect(
    `https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_url=${req.headers.host}/api/callback&response_type=code&scope=identify+guilds+guilds.join`
  );
});

app.get("/api/callback", async (req, res) => {
  if (!req.query.code) throw new Error("NoCodeProvided");
  let opts = {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
    }
  };
  let response = await fetch(
    `https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${req.query.code}`,
    opts
  );
  let json = await response.json();
  res.redirect(
    `/api/store?tokens=${encodeURIComponent(JSON.stringify(json))}&getcode=true`
  );
});

app.get("/api/code", async (req, res) => {
  if (!req.query.tokens) res.redirect("/");
  let c = JSON.parse(req.query.tokens).refresh_token;
  let response = await fetch(
    `https://discordapp.com/api/oauth2/token?grant_type=refresh_token&refresh_token=${c}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      }
    }
  );
  let json = await response.json();
  response = await fetch("https://discordapp.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${json.access_token}`
    }
  });
  let user = await response.json();
  res.redirect(
    `/api/store?tokens=${encodeURIComponent(
      JSON.stringify(json)
    )}&user=${encodeURIComponent(JSON.stringify(user))}`
  );
});

app.get("/api/join", async (req, res) => {
  let g = req.query.guild;
  let u = req.query.user;
  let token = req.query.token;
  let x = await client.guilds.get(g).addMember(u, {
    accessToken: token
  });
  res.send(x);
});

app.get("/api/info", (req, res) => {
  if (!req.query.tokens)
    return res.json({
      error: "Invalid Token"
    });
  fetch("https://discordapp.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${JSON.parse(req.query.tokens).access_token}`
      }
    })
    .then(res => res.json())
    .then(user => {
      if (!user || user.error)
        return res.json({
          error: "Invaid bearer token"
        });
      res.json(user);
    });
});

app.get("/api/store", (req, res) => {
  res.send(
    `<script>localStorage.setItem("tokens", '${
      req.query.tokens
    }');localStorage.setItem("user", '${req.query.user}');if (${
      req.query.getcode
    }) {location.href="/api/code?tokens=${encodeURIComponent(
      req.query.tokens
    )}"} else {location.href="/"}</script>`
  );
});

app.get("/api/logout", (req, res) => {
  res.send(
    `<script>localStorage.removeItem("tokens");localStorage.removeItem("user");location.href="/"</script>`
  );
});

app.get("/api/invite", (req, res) => {
  if (req.query.id)
    return res.redirect(
      `https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=3080&scope=bot&guild_id=${req.query.id}`
    );
  else
    return res.redirect(
      `https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=3080&scope=bot`
    );
});

app.get("/api/guild/:id", (req, res) => {
  if (client.guilds.get(req.params.id) == undefined)
    return res.json({
      result: false
    });
  else
    return res.json({
      result: true
    });
});

app.get("/api/install/:guildid", async (req, res) => {
  let backupid = req.query.id;
  if (!req.query.tokens || !req.query.id || !req.params.guildid)
    return res.json({
      error: "Invalid Request"
    });

  let guilds = await fetch(
    `${domain}/api/info?tokens=${encodeURIComponent(req.query.tokens)}`
  );
  guilds = await guilds.json();
  let find = guilds.find(x => x.id === req.params.guildid);
  if (!find)
    return res.json({
      error: "You are not in this guild."
    });
  let perms = new Discord.Permissions(find.permissions).has("MANAGE_GUILD");
  if (!perms)
    return res.json({
      error: "You don't have enough perms to install backups."
    });

  let guild = client.guilds.get(req.params.guildid);
  if (
    guild.roles.size - 1 - guild.me.roles.find(x => x.managed).rawPosition !==
    0
  )
    return res.json(
      `Error: Please make sure the role called ${
        message.guild.me.roles.find(x => x.managed).name
      } is above all the others in Server Settings > Roles and try again.`
    );
  let r = await client.tasks
    .find(x => x.name === "install")
    .run(guild, backupid);
  res.json({
    result: r
  });
});

app.get("/api/backup/:guildid", async (req, res) => {
  if (!req.query.tokens || !req.params.guildid)
    return res.json({
      error: "Invalid Request"
    });

  let guilds = await fetch(
    `${domain}/api/info?tokens=${encodeURIComponent(req.query.tokens)}`
  );
  guilds = await guilds.json();
  let find = guilds.find(x => x.id === req.params.guildid);
  if (!find)
    return res.json({
      error: "You are not in this guild."
    });
  let perms = new Discord.Permissions(find.permissions).has("MANAGE_GUILD");
  if (!perms)
    return res.json({
      error: "You don't have enough perms to backup this guild."
    });

  let guild = client.guilds.get(req.params.guildid);
  let r = await client.tasks.find(x => x.name === "backup").run(guild);
  res.json({
    result: `Successfully backed up guild. Your backup id is: ${r}`
  });
});

app.get("/api/guildinfo/:id", async (req, res) => {
  if (!req.query.tokens)
    return res.json({
      error: "No token provided"
    });

  let found = JSON.parse(client.settings.backups).find(
    guild => guild.id == req.params.id
  );
  if (found === undefined) found = {
    error: "No backups found."
  };

  setTimeout(async () => {
    let guilds = await fetch(
      `${domain}/api/info?tokens=${encodeURIComponent(req.query.tokens)}`
    );
    guilds = await guilds.json();
    if (!Array.isArray(guilds)) return res.json({
      error: "You are being ratelimited. Reload the page after a few seconds."
    });
    let find = guilds.find(x => x.id === req.params.id);
    if (!find)
      return res.json({
        error: "You are not in this guild."
      });
    let perms = new Discord.Permissions(find.permissions).has("MANAGE_GUILD");
    if (!perms)
      return res.json({
        error: "You don't have enough perms to view backups."
      });

    return res.json(found);
  }, 2000)
});

app.get("/info/:id", (req, res) => {
  res.render("guild/index", {});
});

app.get("/new", (req, res) => {
  res.redirect(
    `https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=3080&scope=bot`
  );
});

// Discord bot config
const client = new Client({
  commandEditing: true,
  prefix: prefix,
  disabledCorePieces: ["commands"],
  providers: {
    default: "mongodb"
  },
  gateways: {
    clientStorage: {
      schema: Client.defaultClientSchema.add("backups", "string", {
        default: "[]"
      })
    }
  }
});

client.on("klasaReady", () => {
  client.schedule.create("backup", "0 0 * * 0");
  client.user.setPresence({
    activity: {
      name: `for ${prefix}help`,
      type: "WATCHING"
    }
  });
});

client.login();
