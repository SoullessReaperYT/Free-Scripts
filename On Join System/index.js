import { world } from "@minecraft/server"
import { ActionFormData } from "@minecraft/server-ui"

world.afterEvents.playerSpawn.subscribe(async ({ player, initialSpawn }) => {
    if (!initialSpawn) return
    JoinForm(player)
})

function JoinForm(player) {
    new ActionFormData()
        .title("your title here")
        .body("welcome to the server")
        .button("close")
        .show(player).then(({ selection, canceled, cancelationReason }) => {
            if (canceled || cancelationReason === 'UserBusy') return JoinForm(player)
            switch (selection) { case 0: player.sendMessage("thank you for reading"); break; }
        })
}