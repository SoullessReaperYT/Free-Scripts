import { world, Player } from "@minecraft/server"

/**
 * This function subscribes to the 'entityDie' event in the 'afterEvents' of the 'world' object.
 * When an entity dies, it increments the 'deaths' count of the dead entity.
 * If the cause of the damage was an 'entityAttack' and the damaging entity was an instance of 'Player',
 * it increments the 'kills' count of the damaging entity.
 * 
 * @param {Object} data - The data object containing information about the event.
 * @param {Object} data.deadEntity - The entity that died.
 * @param {Object} data.deadEntity.score - The score object of the dead entity.
 * @param {number} data.deadEntity.score.deaths - The number of times the entity has died.
 * @param {Object} data.damageSource - The source of the damage.
 * @param {string} data.damageSource.cause - The cause of the damage.
 * @param {Object} data.damageSource.damagingEntity - The entity that caused the damage.
 * @param {number} data.damageSource.damagingEntity.score.kills - The number of kills the damaging entity has.
 * @param {Object} options - The options for the subscription.
 * @param {string[]} options.entityTypes - The types of entities to subscribe to the event for.
 */
world.afterEvents.entityDie.subscribe((data) => {
    addScore(data.deadEntity, 'Deaths', 1)
    if (data.damageSource.cause === 'entityAttack' && (data.damageSource.damagingEntity instanceof Player)) return addScore(data.damageSource.damagingEntity, 'Kills', 1)
}, { "entityTypes": ['minecraft:player'] })

function addScore(player, objective, score) {
    try {
        world.scoreboard.getObjective(objective).addScore(player, score)
    } catch (e) {
        player.runCommand(`scoreboard players add "${player.name}" ${objective} ${score}`)
    }
}