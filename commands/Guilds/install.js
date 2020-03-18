const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: "Install a backups on the server",
            permissionLevel: 6,
            requiredPermissions: 8,
            runIn: ["text"],
            usage: "[ID:string]"
        });
    }
    async run(message, [ID]) {
      let b = JSON.parse(message.client.settings.backups);
      let chosen = b.find(b => b.backupID == ID);
      if (!chosen) return message.channel.send(`❌ Invalid backup ID`);
      else message.delete();
      
      
      if (
          (message.guild.me.roles.cache.find(x => x.managed).rawPosition &&
          ((message.guild.roles.size - 1) - message.guild.me.roles.cache.find(x => x.managed).rawPosition !== 0))
         ) 
        return message.channel.send(`❌ I do not have enough permissions to install a backup. Please make sure the role called \`${message.guild.me.roles.find(x => x.managed).name}\` is above all the others in \`Server Settings > Roles\` and try this command again.`)
      else if (
          !message.guild.me.roles.cache.find(x => x.managed).rawPosition &&
          message.guild.me.roles.size > 0 &&
          ((message.guild.roles.size - 1) - message.guild.me.roles.highest !== 0)
          )
          return message.channel.send(`❌ I do not have enough permissions to install a backup. Please make sure my highest role, (\`${message.guild.me.roles.highest.name}\` is above all the others in \`Server Settings > Roles\` and try this command again.`)
      let res = await this.prompt(message)
      if (!res) return;
      
      this.client.tasks.find(x => x.name == "install").run(message.guild, ID)
    }
  
    async prompt(message) {
      let e = new MessageEmbed()
      .setColor(0xff0050)
      .setDescription(`Are you sure you want to install a backup. It will override the current server.\nReply with \`confirm\` to continue`)
      .setFooter(`Cancelling in 30s`)
      message.channel.send(e);
      const filter = m => m.author.id === message.author.id;
      let msg = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] });
      msg = msg.first().content.toLowerCase();
      if (msg !== "confirm") message.channel.send('Cancelled')
      else return true;
      return false;
    }
};
