import { Player, world, system } from '@minecraft/server';

export const commands = [];
let CommandInitialized = false;

Object.defineProperty(globalThis, 'ChatCommand', {
    get: function () {
        const prefix = '.';
        return {
            /**
* Creates a new chat command.
* @param {string} command - The command name.
* @param {string} description - Description of the command.
* @param {string[]} [alias=[]] - Array of aliases for the command.
* @param {boolean|((player: Player) => boolean)} [permissions=false] - Boolean or function indicating if the player has permission to use the command.
* @param {((player: Player, args: {key: string | boolean | number}, commandString: string) => void)} callback - The function to execute when the command is triggered.
* @param {{key: 'string' | 'bool' | 'number'}} args 
* @returns {void}
*/
            create(command, description, alias = [], args, permissions = false, callback) {
                commands.push({ command, description, args, alias, permissions, callback });
                if (CommandInitialized) return;
                CommandInitialized = true;
                world.beforeEvents.chatSend.subscribe((data) => {
                    const { message, sender: player } = data;
                    if (!message.startsWith(prefix)) return;
                    data.cancel = true;
                    const commandString = message.slice(prefix.length).trim();
                    const matchedCommand = commands.find(({ command, alias }) => new RegExp(`^${command}(\\s|$)`, 'i').test(commandString) || (alias && alias.some(a => new RegExp(`^${a}(\\s|$)`, 'i').test(commandString))));
                    const findCommandString = commands.reduce((result, { command, alias }) => !result && new RegExp(`^${command}(\\s|$)`, 'i').test(commandString) ? command : result || (alias && alias.find(v => new RegExp(`^${v}(\\s|$)`, 'i').test(commandString))) || null, null);
                    if (matchedCommand && (!matchedCommand.permissions || matchedCommand.permissions(player))) {
                        if (matchedCommand.args) {
                            const input = commandString.slice(findCommandString.length).match(/(?:[^\s"]+|"[^"]*")+/g) || ''
                            const parsedArgs = {};
                            const errors = [];
                            Object.entries(matchedCommand.args).forEach(([arg, type], index) => {
                                const typedata = {
                                    'number': (() => isNaN(parseInt(input[index])) ? errors.push(`§c'§f${arg}§c' is not a Number`) : parsedArgs[arg] = parseInt(input[index])),
                                    "boolean": (() => !['true', 'false'].includes(input[index]) ? errors.push(`§c'§f${arg}§c' is not a true or false`) : parsedArgs[arg] = JSON.parse(input[index])),
                                    "string": (() => (!isNaN(parseInt(input[index])) || ['true', 'false'].includes(input[index]) || typeof input[index] !== 'string') ? errors.push(`§c'§f${arg}§c' is not a string`) : parsedArgs[arg] = input[index])
                                }
                                typedata[type]()
                            })
                            if (errors.length > 0) return player.sendMessage(`§cError parsing command arguments: ${errors.join(', ')}`);
                            matchedCommand.callback(player, parsedArgs, findCommandString);
                        } else matchedCommand.callback(player, false, findCommandString);
                    } else player.sendMessage(`§cUnknown command: ${commandString}, Please check that the command exists and that you have permission to use it.`);
                });
            }

        };
    },
});
export default globalThis.ChatCommand;