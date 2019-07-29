const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: "Backup the server"
        });
    }
    async run(message) {
      if (!message.member.hasPermission('MANAGE_GUILD'))
          return message.channel.send(`You do not have enough permissions to run a backup. You need \`Manage Guild\`.`)
      let res = await this.prompt(message)
      if (res) {
        message.client.tasks.first().run(message.guild, message.author);
        message.channel.send(`✅ Backed up the server. Check your DMs for backup key`)
      }
    }
  
    async prompt(message) {
      let e = new MessageEmbed()
      .setColor(0xff0050)
      .setDescription(`Are you sure you want to run a backup? It will override all previous backups of this server by all other admins.\nReply with \`confirm\` to continue`)
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
