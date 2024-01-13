import { world, Player } from "@minecraft/server";

/**
 * Owner: THE BOSS9345
 * Github: https://github.com/THEBOSS9345/Scripts-API/tree/main/Database
 */

Object.defineProperty(globalThis, 'Database', {
    get: function () {
        return {
            /**
             * Set a value in the database.
             * @param {string} key - The database key.
             * @param {boolean | number | string} value - The value to set.
             * @param {Player} [player=null] - The player for whom to set the database (default: null, i.e., set to world).
             * @example
             * set('auction', JSON.stringify({'dirt': 1})) // set to world
             * set('auction', JSON.stringify({'dirt': 1}), player) // set to player
             */
            set(key, value, player = null) {
                (player || world).setDynamicProperty(key, value);
            },
            /**
           * Get a value from the database.
           * @param {string} key - The database key.
           * @param {Player} [player=null] - The player from whom to get the database (default: null, i.e., get from world).
           * @returns {boolean | number | string | null} The value of the specified key.
           */
            get(key, player = null) {
                return (player || world).getDynamicProperty(key);
            },
            /**
            * Check if a key exists in the database.
            * @param {string} key - The database key.
            * @param {Player} [player=null] - The player to check for the key (default: null, i.e., check in world).
            * @returns {boolean} True if the key exists, false otherwise.
            */
            has(key, player = null) {
                return !!(player || world).getDynamicProperty(key);
            },
            /**
             * Delete a key from the database.
             * @param {string} key - The database key to delete.
             * @param {Player} [player=null] - The player from whom to delete the key (default: null, i.e., delete from world).
             */
            delete(key, player = null) {
                (player || world).setDynamicProperty(key, null);
            },
            /**
             * Retrieves dynamic properties and their values from the specified player or world object.
             * @param {Object} [player=null] - The player class (default is null, i.e., entries from world).
             * @returns {Array} An array of objects, each containing a dynamic property ID as a key and its corresponding value.
             */
            entries(player) {
                return (player || world).getDynamicPropertyIds().map((value) => [value, (player || world).getDynamicProperty(value)])
            }
        };
    }
});
console.warn(`§aDatabase initialized!`)
export default globalThis.Database;