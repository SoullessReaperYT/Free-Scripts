import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"

world.beforeEvents.itemUse.subscribe(data => {
    let player = data.source
    let title = "§l§o§uGui Title Here"
    if (data.itemStack.typeId == "minecraft:compass") return;

    function main() {
        const form = new ActionFormData()
            .title(title)
            .body(`§l§o§5Welcome §d${player.nameTag}§5! §5Choose a Option Below!`)
            .button(`§3Warps\n§7[ Click to View ]`)
            .button(`§5Discord Code\n§7[ Click to View ]`)
            .button(`§aMoney Transfer\n§7[ Click to View ]`)
            .button(`§6Credits\n§7[ Click to View ]`)
            .button(`§cExit Menu`)
        form.show(player).then(r => {
            if (r.selection == 0) Warps(player)
            if (r.selection == 1) DiscordKit(player)
            if (r.selection == 2) moneyTransfer(player)
            if (r.selection == 3) Credits(player)
        })
    }

    function Warps() {
        new ActionFormData()
            .title(title)
            .button("§o§bLocation 1\n§7[ Click to Teleport ]")
            .button("§o§bLocation 2\n§7[ Click to Teleport ]")
            .button("§o§bLocation 3\n§7[ Click to Teleport ]")
            .button(`§l§cBack`)
            .show(player).then(r => {
                if (r.selection == 0) {
                    player.sendMessage(`§cTeleported §4${player.nameTag} §cTo Location 1`)//Change " Location 1" To Wherever They Are being Teleported
                    player.runCommandAsync("tp 0 0 0")//Change Cords To Where You Want Them To Go
                }
                if (r.selection == 1) {
                    player.sendMessage(`§cTeleported §4${player.nameTag} §cTo Location 2`)//Change " Location 2" To Wherever They Are being Teleported
                    player.runCommandAsync("tp 0 0 0")//Change Cords To Where You Want Them To Go
                }
                if (r.selection == 2) {
                    player.sendMessage(`§cTeleported §4${player.nameTag} §cTo Location 3`)//Change " Location 3" To Wherever They Are being Teleported
                    player.runCommandAsync("tp 0 0 0")//Change Cords To Where You Want Them To Go
                }
                if (r.selection == 3) main(player)
            })
    }

    function DiscordKit(player) {
        let DiscordKit = new ModalFormData()
        DiscordKit.title(title);
        DiscordKit.textField('§l§dDiscord Join Code§f: §uDISCORD CODE HERE\n\n§l§uEnter Discord Code Below', '§fPut Code Here')
        DiscordKit.show(player).then((r) => {
            if (r.formValues[0] == 'CODE') {//Put Code in "CODE"
                try {
                    player.runCommand(`execute @s[scores={DiscordKit=1..}] ~~~ tellraw @s {"rawtext":[{"text":"§cYou have already claimed your Discord reward"}]}`)
                }
                catch (e) {
                    player.runCommandAsync(`execute at @s[scores={DiscordKit=0}] run tellraw @a {"rawtext":[{"text":"§l§d"},{"selector":"@s"},{"text":"§5 Has Claimed Their Discord Reward of §a+§2$150§f! \n\n§fJoin The Discord§7:\n§9DISCORD CODE HERE"}]}`);
                    player.runCommandAsync(`execute at @s[scores={DiscordKit=0}] run scoreboard players add @s Money 150`);//Change "Money" To Your Money Objective
                    player.runCommandAsync(`scoreboard players set @s[scores={DiscordKit=0}] DiscordKit 1`);
                } //Make A Objective Named "DiscordKit" So They Cant Claim More Than Once
            }
        })
    }
    const getScore = (objective, target, useZero = true) => {
        try {
            const obj = world.scoreboard.getObjective(objective);
            if (typeof target == 'string') {
                return obj.getScore(obj.getParticipants().find(v => v.displayName == target));
            }
            return obj.getScore(target.scoreboard);
        } catch {
            return useZero ? 0 : NaN;
        }
    }

    const moneyTransfer = (player) => {
        const players = [...world.getPlayers()];
        new ModalFormData()
            .title(title)
            .dropdown('§o§5        Choose Who To Send Money!', players.map(player => player.nameTag))
            .textField(`§uEnter The Amount Your Sending!\n§dCurrent Amount Of Money=§5 (${getScore('Money', player.nameTag)})`, `§o             Only Use Numbers`)
            .show(player)
            .then(({ formValues: [dropdown, textField] }) => {
                const selectedPlayer = players[dropdown];

                if (selectedPlayer === player) {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou Cant Select Yourself"}]}`)
                    return
                } if (textField.includes("-")) {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cOnly Use Numbers"}]}`)
                    return
                }
                if (getScore('Money', player.nameTag) < textField) {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou Dont Have Enough Money"}]}`);
                    return;
                } try {
                    player.runCommandAsync(`scoreboard players remove @s Money ${textField}`)
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aSent §l${selectedPlayer.nameTag} §r§2$${textField}"}]}`)
                    selectedPlayer.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§l${player.nameTag} §r§aHas Given You §2$${textField}"}]}`);
                    selectedPlayer.runCommandAsync(`scoreboard players add @s Money ${textField}`)
                } catch {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cOnly Use Numbers"}]}`)
                    return
                }
            }).catch((e) => {
                console.error(e, e.stack)
            });
    }//Change "Money" To Your Money Objective!

    function Credits() {
        new ActionFormData()
            .title(title)
            .body(`§l§o§6                Credits\n\n§5ROLE=\n§dUSERNAME HERE`)
            .button(`§l§cBack`)
            .show(player).then(r => {
                if (r.selection == 0) main(player)
            })
    }


})