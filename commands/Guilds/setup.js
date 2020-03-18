const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

const { DOMAIN } = process.env;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: "Setup verification for the server",
            permissionLevel: 6
        });
    }
    async run(message) {
        if (!message.guild.me.hasPermission(268435472)) 
            return message.channel.send(`I do not have enough permissions. Make sure I have \`Admin\` settings.`);
        
        let p = await this.prompt(message);
        if (p) {
            message.guild.roles.everyone.setPermissions(0)
            let role = await message.guild.roles.create({
                data: {
                    name: "Verified",
                    position: 0,
                    permissions: 3072
                }
            })
            let channel = await message.guild.channels.create("verification", {
                type: "text",
                topic: "To join the server, you have to follow the steps outlined below.",
                position: 0,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        allow: 1024,
                        deny: 2048,
                        type: "role"
                    },
                    {
                        id: role.id,
                        deny: 3072,
                        type: "role"
                    }
                ]
            });
            let e = new MessageEmbed()
            .setColor(0xff0050)
            .setDescription(`To access the server, you'll need to sign in at ${DOMAIN}/verify/${message.guild.id}`)
            channel.send(e)
        }
    }
  
    async prompt(message) {
      let e = new MessageEmbed()
      .setColor(0xff0050)
      .setDescription(`Are you sure you want to setup verification?
      This will create a verification channel and a verified role.
      Users will need to confirm by signing in with discord on the web interface.
      Reply with \`confirm\` to continue`)
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
