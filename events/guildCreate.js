const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { PREFIX, DOMAIN } = process.env;

module.exports = class extends Event {

	run(guild) {
		let m = new MessageEmbed()
			.setColor(0xff0050)
			.setDescription(`Welcome to BackupBot. To setup verification, use the \`${PREFIX}setup\` command. For a list of commands, use \`${PREFIX}help\`. You can also use the [website](${DOMAIN}) to manage your server.`)
		let channel = guild.systemChannel;
		channel.send(m)
	}

};