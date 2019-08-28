const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            aliases: ["inv"],
            description: language => language.get('COMMAND_INVITE_DESCRIPTION')
        });
    }

    async run(message) {
        return message.channel.send(`Add me to your server: <${this.client.invite}>`)
    }

};