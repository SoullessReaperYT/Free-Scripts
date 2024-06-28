import { world, system } from '@minecraft/server';

const items = [
  { typeId: 'minecraft:stone', price: 1 },
  { typeId: 'minecraft:dirt', price: 1 },
  { typeId: 'minecraft:grass_block', price: 1 },
];

const sellBlockType1 = 'minecraft:beacon';

system.runInterval(checkSellBlock, 20);

function checkSellBlock() {
  world.getAllPlayers().forEach(player => {
      const blockBelow = player.dimension.getBlock({
          x: Math.floor(player.location.x),
          y: Math.floor(player.location.y) - 1,
          z: Math.floor(player.location.z)
      });

      if (blockBelow && blockBelow.typeId === sellBlockType1) {
          sell(player);
      }
  });
}

function sell(player) {
  const inv = inventory(player);
  inv.forEach(item => {
      const itemData = items.find(data => data.typeId === item.typeId);
      if (itemData) {
          const totalPrice = item.amount * itemData.price;
          const objective = 'kill_coins';
          player.runCommand(`scoreboard players add @s ${objective} ${totalPrice}`);
          player.runCommand(`clear @s ${item.typeId} 0 ${item.amount}`);
          player.sendMessage(`§6You sold §f${item.amount} ${item.typeId.split(':')[1]} §6for §2${totalPrice}$!`);
      }
  });
}

function inventory(player) {
  const inv = player.getComponent('inventory').container;
  const itemObjects = Array.from({ length: 36 })
      .map((_, i) => inv.getItem(i))
      .filter(item => item)
      .map(item => ({ typeId: item.typeId, amount: item.amount }));
  return itemObjects;
}
