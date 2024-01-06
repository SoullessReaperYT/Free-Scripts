import { Player, system, world, ItemStack, Enchantment } from '@minecraft/server';
import { MessageFormData } from '@minecraft/server-ui'
world.beforeEvents.playerInteractWithEntity.subscribe((data) => (data.target.typeId === 'minecraft:cow') ? system.run(() => mainform(data.player)) : null)

// Daily reward items configuration
const rewardItems = [
    ['minecraft:diamond', 1],
    ['minecraft:diamond_sword', 1, [new Enchantment('mending')]]
];
/**
 * 
 * @param {Player} player 
 * @returns 
 */
function mainform(player) {
    const playerdata = player.getDynamicProperty('rewards') ? JSON.parse(player.getDynamicProperty('rewards')) : null
    if (player.getDynamicProperty('rewards') && !hasTimerReachedEnd(playerdata.targetDate)) {
        const time = getTime(playerdata);
        return player.sendMessage(`§c<System>§7: Time left §aHours§7: ${time.hours}, §aMinutes§7: ${time.minutes}, §aSeconds§7: ${time.seconds}`);
    }
    new MessageFormData()
        .title('§cDaily §6Rewards')
        .body('§aWelcome to daily rewards.§r Click the button to claim your reward.')
        .button2('§aClaim')
        .button1('§cExit')
        .show(player)
        .then(({ selection, canceled }) => {
            if (canceled || selection === 0) return player.sendMessage('§c<System>§7: You have closed the menu');
            addItems(player, [rewardItems[Math.floor(Math.random() * rewardItems.length)]])
            player.playSound('random.levelup');
            const nextRewardTime = setTimer(12, 'hours');
            player.sendMessage(`§c<System>:§7 You have received a daily reward. The next reward will be available in §aDays§7: ${getTime(nextRewardTime).days}, §aHours§7: ${getTime(nextRewardTime).hours}, §aMinutes§7: ${getTime(nextRewardTime).minutes}, §aSeconds§7: ${getTime(nextRewardTime).seconds}`);
            player.setDynamicProperty('rewards', JSON.stringify({ targetDate: nextRewardTime.targetDate }));
        });
}

const formatTime = (milliseconds) => ({
    days: Math.floor(milliseconds / (1000 * 60 * 60 * 24)),
    hours: Math.floor((milliseconds / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((milliseconds / (1000 * 60)) % 60),
    seconds: Math.floor((milliseconds / 1000) % 60),
});


export const getTime = (timerInfo) => {
    const targetDate = new Date(timerInfo.targetDate);
    const timeRemaining = targetDate - new Date();
    return formatTime(timeRemaining);
};


export const setTimer = (value, unit) => {
    const targetDate = new Date();
    const units = { hours: 'Hours', days: 'Date', minutes: 'Minutes', seconds: 'Seconds' };
    targetDate[`set${units[unit]}`](targetDate[`get${units[unit]}`]() + value);
    return { value, unit, targetDate };
};

export function hasTimerReachedEnd(targetDate) {
    if (!(targetDate instanceof Date)) targetDate = new Date(targetDate);
    const currentDate = new Date();
    return currentDate > targetDate;
}

function addItems(player, items) {
    system.run(() => {
        try {
            const inv = player.getComponent("inventory").container;
            for (let [item, count, enchants] of items) {
                const itemStack = new ItemStack(item, count);
                if (enchants && enchants.length > 0) {
                    const enchantComp = itemStack.getComponent(
                        "minecraft:enchantments"
                    ).enchantments;
                    for (const enchant of enchants)
                        enchantComp.addEnchantment(enchant);
                    itemStack.getComponent("minecraft:enchantments").enchantments =
                        enchantComp;
                }
                inv.addItem(itemStack);
            }
        } catch (error) {
            console.log("inventory", error);
        }
    });
}