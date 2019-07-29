const { Command, util: { exec, codeBlock }, Store, Stopwatch } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Refresh data',
			guarded: true,
			permissionLevel: 10
		});
	}

	async run(msg) {
		const result = await exec("git pull origin master", { timeout: 'timeout' in msg.flags ? Number(msg.flags.timeout) : 60000 })
			.catch(error => ({ stdout: null, stderr: error }));
    return this.everything(msg);
	}

	async everything(message) {
		const timer = new Stopwatch();
		await Promise.all(this.client.pieceStores.map(async (store) => {
			await store.loadAll();
			await store.init();
		}));
		if (this.client.shard) {
			await this.client.shard.broadcastEval(`
				if (String(this.shard.id) !== '${this.client.shard.id}') this.pieceStores.map(async (store) => {
					await store.loadAll();
					await store.init();
				});
			`);
		}
		return message.sendLocale('COMMAND_RELOAD_EVERYTHING', [timer.stop()]);
	}

};
