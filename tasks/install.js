const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');

wait = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, ms)
  })
}

module.exports = class extends Task {
    constructor(...args) {
        super(...args, { name: 'install', enabled: true });
    }

    async run(guild, id) {
      let b = JSON.parse(this.client.settings.backups);
      let chosen = b.find(b => b.backupID == id);
      if (!chosen) return `Invalid backup ID`
        
      // Emojis
      guild.emojis.each(x => x.delete())

      
      // Roles
      for (let role of guild.roles.array()) {
        try {
          if (role.id !== role.guild.id && ! role.managed) {
            await role.delete();
            await wait(100);
          }
        } catch(e) {console.log(role);console.log(e);}
      };
      for (let role of chosen.roles) {
        if (role.id !== role.guild && ! role.managed) {
          try {
            await guild.roles.create({
              data: {
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                position: role.rawPosition,
                permissions: role.permissions,
                mentionable: role.mentionable
              }
            });
          } catch(e) {}
        }
      }
      
      
      // Channels
      let old = guild.channels.array()
      for (let ch of old) {
        await ch.delete();
        await wait(100);
      }
      
      let categories = chosen.channels.filter(x => x.type == "category");
      let notcategories = chosen.channels.filter(x => x.type !== "category");
      for (let ch of categories) {
        for (let ow in ch.permissionOverwrites) {
          if (ch.permissionOverwrites[ow].role)
            ch.permissionOverwrites[ow].id = guild.roles.find(x => x.name == ch.permissionOverwrites[ow].role).id
        }
        await guild.channels.create(ch.name, {
          type: ch.type,
          topic: ch.topic ? ch.topic : "",
          nsfw: ch.nsfw,
          position: ch.rawPosition,
          rateLimitPerUser: ch.rateLimitPerUser,
          bitrate: ch.bitrate,
          userLimit: ch.userLimit,
          permissionOverwrites: ch.permissionOverwrites
        })
      }
      for (let ch of notcategories) {
        for (let ow in ch.permissionOverwrites) {
          if (ch.permissionOverwrites[ow].role)
            ch.permissionOverwrites[ow].id = guild.roles.find(x => x.name == ch.permissionOverwrites[ow].role).id
        }
        let cat = guild.channels.array().find(x => x.name == ch.parent && x.type == "category");
        if (ch.parent && cat) {
          await guild.channels.create(ch.name, {
            type: ch.type,
            topic: ch.topic ? ch.topic : "",
            nsfw: ch.nsfw,
            position: ch.rawPosition,
            rateLimitPerUser: ch.rateLimitPerUser,
            bitrate: ch.bitrate,
            userLimit: ch.userLimit,
            parent: cat,
            permissionOverwrites: ch.permissionOverwrites
          })
        } else
        await guild.channels.create(ch.name, {
          type: ch.type,
          topic: ch.topic ? ch.topic : "",
          nsfw: ch.nsfw,
          position: ch.rawPosition,
          rateLimitPerUser: ch.rateLimitPerUser,
          bitrate: ch.bitrate,
          userLimit: ch.userLimit,
          permissionOverwrites: ch.permissionOverwrites
        })
      }
      
      
      // emojis
      for (let emoji of chosen.emojis) {
        guild.emojis.create(emoji.url, emoji.name)
      }
      
      // Members
      let m = await guild.members.fetch()
      for (let member of m.array()) {
        let equivalent = chosen.members.find(x => x.user.id === member.user.id);
        if (equivalent) {
          for (let role of equivalent.roles) {
            if (role && !role.managed && role.rawPosition !== 0) {
              let r = guild.roles.find(x => x.name === role.name);
              await member.roles.add(r.id)
            }
          }
        }
      }
      
      
      // Management
      guild.setName(chosen.name);
      guild.setIcon(`${chosen.iconURL.replace('.webp', '.png')}?size=2048`);
      guild.setRegion(chosen.region);
      guild.setAFKChannel(guild.channels.get(chosen.afkChannelID));
      guild.setAFKTimeout(chosen.afkTimeout);
      guild.setVerificationLevel(chosen.verificationLevel);
      guild.setExplicitContentFilter(chosen.explicitContentFilter);
      guild.setDefaultMessageNotifications(chosen.defaultMessageNotifications);
      guild.setSystemChannel(guild.channels.get(chosen.systemChannelID));
      return `Success`
 }
};
