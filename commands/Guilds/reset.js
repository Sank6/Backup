const { Command } = require('klasa');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: "Reset the backups",
            permissionLevel: 10
        });
    }
    async run(message) {
      message.client.settings.reset('backups')
      message.channel.send(`✅ Reset the backups.`)
    }
};
