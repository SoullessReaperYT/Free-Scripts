import { Player, world, system } from '@minecraft/server';
import ChatCommand from './index.js'
import { commands } from './index.js';

// way 1 to make commands
ChatCommand.create('Help', 'Help Command: Shows all available commands', ['h', 'help'], false, false, (player) => {
    const helpMessage = commands
        .filter(command => !command.permissions || command.permissions(player))
        .map(command => {
            const alias = command.alias.length > 0 ? `[${command.alias.join(', ')}] ` : '';
            const description = command.description ? command.description : '';
            return `§7${command.command} - ${alias}${description}`;
        })
        .join('\n');
    player.sendMessage(`§aAvailable Commands\n${helpMessage}\n`);
});

//  way 2 make commands
ChatCommand.create('command name', 'desc', ['cmd', 'comand'], false, (player => player.hasTag('cmd')), ((player, _, commandString) => {
    player.sendMessage(`${player.name}, ${commandString}`)
    system.run(() => player.runCommand(`gamemode s "${player.name}"`))
}))

// way 3 to make commands
ChatCommand.create('find', 'find player', ['d ssd ds'], { 'target': 'string', 'amount': 'number' }, false, (player, args) => {
    console.warn(args[`target`], args[`amount`])
    const findplayer = world.getPlayers({ name: `${args['target']?.split('"')[1]}` })[0]
    if (!findplayer) return player.sendMessage(`${args[`target`]} not found`)
    console.warn(findplayer.name)
});
