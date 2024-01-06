// Import necessary modules and classes
import { world, system, Player } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import Database from "./Database/index.js";
import { setTimer, getTime, hasTimerReachedEnd } from "./functions/index.js";

// Event listener for item use
world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => item.typeId === 'minecraft:compass' ? reportMenu(player) : null);

// Configuration
const config = {
    AdminTag: 'Admin',                     // Tag for admin players
    formLeaveMessage: "§cMenu Closed",     // Message displayed when a menu is closed                      
    ReportTime: setTimer(1, 'days'),     // Default reporting time (24 hours)
    creportableOptions: [                  // Options for player reports
        'Cheating e.g X-Ray',
        'Hacking e.g Kill Aura',
        'Exploiting Bugs',
        'Rule Breaking',
        'Harassment',
        'Inappropriate Language',
        'Racism',
        'Spamming',
        'Impersonation',
        'Inappropriate Content',
        'Unsportsmanlike Conduct',
        'Disruptive Behavior',
        'Violent or Threatening Behavior',
        'Griefing',
        'Scamming',
        'Advertising',
        'Other',
    ]
};

function reportMenu(player) {
    // Create a new ActionFormData for the main report menu
    const form = new ActionFormData();
    form.title('§cReport Menu');
    form.body(`Welcome to the report menu.\n${player.name} Please select an option below.`);
    form.button('§cMake A Report');

    // Add the 'View Reports' button only if the player has admin privileges
    if (player.hasTag(config.AdminTag)) {
        form.button('§6View Reports');
    }

    form.button('§cExit');

    // Show the main report menu to the player
    form.show(player).then(({ selection }) => {
        switch (selection) {
            case 0: MemberReport(player); break;
            case 1:
                // Check if the player has admin privileges before navigating to the admin report menu
                if (player.hasTag(config.AdminTag)) {
                    return AdminReportMenu(player);
                } else {
                    // Notify non-admin players that they don't have access to view reports
                    player.sendMessage(config.formLeaveMessage);
                }
                break;
            default: player.sendMessage(config.formLeaveMessage); break;
        }
    });
}

function MemberReport(player) {
    // Create a new ActionFormData for the member report menu
    new ActionFormData()
        .title('§cMake A Report')
        .body('What type of report would you like to make?')
        .button('Bug Report', "textures/ui/debug_glyph_color")
        .button('Player Report', `textures/ui/Friend2`)
        .button('Back', `textures/ui/cancel`)
        .show(player).then(({ selection }) => {
            // Check the user's selection and navigate accordingly
            if (selection === 0) return BugReport(player);
            if (selection === 1) return PlayerReport(player);
            if (selection === 2) return reportMenu(player);
        });
}


// Bug Report Function
function BugReport(player, error) {
    // Create a new ModalFormData for the player to submit a bug report
    new ModalFormData()
        .title('§cBug Report')
        .textField(`What Bug Are You Reporting\n${error?.Confirm ? '§c§l§oReport Not Sent As You Did Not Confirm' : error?.Bug ? '§c§l§oReport Not Sent As You Did Not Put A Bug Name Or The Name Contains Numbers' : error?.Describe ? '§c§l§oReport Not Sent As You Did Not Describe The Bug Or It Contains Numbers' : ''}`, 'Example Bug')
        .textField('Please Describe The Bug In Full Detail', 'You Can Dupe Items By Doing This!!!')
        .toggle('Are You Sure Of This Action It Will Take Some Of Your Info To Show Admins Who Reported This', false)
        .show(player).then(({ canceled, formValues: [reportName, reportDetail, Confirm] }) => {
            // Check if the player canceled the form
            if (canceled) return;

            // Check if the player confirmed the submission
            if (!Confirm) return BugReport(player, { Confirm: true });

            // Validate the input values
            if (typeof reportName !== 'string' || reportName.length <= 0) return BugReport(player, { Bug: true });
            if (typeof reportDetail !== 'string' || reportDetail.length <= 0) return BugReport(player, { Describe: true });

            // Retrieve existing player bug reports or initialize an empty object
            const olddata = Database.has('ReportBug') ? JSON.parse(Database.get('ReportBug')) : {};

            // Check if the player has already submitted 3 bug reports
            if (Database.has('ReportBug') && (olddata[player.name]?.length && olddata[player.name].length >= 3)) {
                return player.sendMessage(`§cYou Have Already Made 3 Reports. Please Wait For Them To Be Resolved/Processed Before Making More`);
            }

            // Add the new bug report to the player's existing bug reports
            olddata[player.name] = [...(olddata[player.name] || []), { ReportName: reportName, ReportDetails: reportDetail, endtime: config.ReportTime }];

            // Update the ReportBug data in the database
            Database.set('ReportBug', JSON.stringify(olddata));

            // Log the updated bug report data for debugging purposes
            console.warn(JSON.stringify(olddata[player.name]), player.name, olddata[player.name].length);

            // Notify the player that the bug report has been submitted
            player.sendMessage('§aYour Bug Report Has Been Sent To The Admins And Will Be Seen To Shortly');
        });
}


// Player Report Function
function PlayerReport(player, error) {
    // Create a new ModalFormData for the player to submit a report
    new ModalFormData()
        .title('§cPlayer Report')
        .textField(`Who You Would Like To Report\n${error?.Confirm ? '§c§l§oReport Not Sent As You Did Not Confirm' : error?.Players ? "§c§l§oReport Not Sent As You Did Not Enter A Player To Report" : error?.Reason ? '§c§l§oReport Not Sent As You Did Not Select A Reason For Reporting The Player' : ''}`, 'ex: Steve')
        .dropdown('Select The Reason For The Report', ['Pick Reason', ...config.creportableOptions])
        .textField('Please Give More Info On The Report (Optional)', 'This Is Not Required')
        .toggle('Are You Sure Of This Action It Will Take Some Of Your Info To Show Admins Who Reported This', false)
        .show(player).then(({ canceled, formValues: [ReportName, ReportReason, reportDetails, Confirm] }) => {
            // Check if the player canceled the form
            if (!Confirm) return PlayerReport(player, { Confirm: true });

            // Validate the input values
            if (typeof ReportName !== 'string' || ReportName.length <= 0) return PlayerReport(player, { Players: true });
            if (ReportReason === 0) return PlayerReport(player, { Reason: true });

            // Retrieve existing player reports or initialize an empty object
            const olddata = Database.has('ReportPlayer') ? JSON.parse(Database.get('ReportPlayer')) : {};

            // Check if the player has already submitted 3 reports
            if (Database.has('ReportPlayer') && (olddata[player.name]?.length && olddata[player.name].length >= 3)) {
                return player.sendMessage(`§cYou Have Already Made 3 Reports. Please Wait For Them To Be Resolved/Processed Before Making More`);
            }

            // Add the new report to the player's existing reports
            olddata[player.name] = [...(olddata[player.name] || []), { PlayerName: ReportName, ReportName: config.creportableOptions[ReportReason - 1], ReportDetails: reportDetails, endtime: config.ReportTime }];

            // Update the ReportPlayer data in the database
            Database.set('ReportPlayer', JSON.stringify(olddata));

            // Log the updated report data for debugging purposes
            console.warn(JSON.stringify(olddata[player.name]), player.name, olddata[player.name].length);

            // Notify the player that the report has been submitted
            player.sendMessage('§aYour Report Has Been Sent To The Admins And Will Be Seen To Shortly');
        });
}


// Admin Report Menu
function AdminReportMenu(player) {
    // Create a new ActionFormData for the main menu
    new ActionFormData()
        .title('§cView Reports')
        .body('What type of reports would you like to see?')
        .button('Bug Reports', "textures/ui/debug_glyph_color")
        .button('Player Reports', `textures/ui/Friend2`)
        .button('Back', `textures/ui/cancel`)
        .show(player).then(({ selection }) => {
            // Check the user's selection and navigate accordingly
            if (selection === 0) return AdminBugReports(player);
            if (selection === 1) return AdminPlayerReport(player);
            if (selection === 2) return reportMenu(player);
        });
}


// Admin Bug Reports Menu
function AdminBugReports(player) {
    // Retrieve ReportBug data from the database, or initialize an empty object
    const dataobject = Database.has('ReportBug') ? JSON.parse(Database.get('ReportBug')) : {};

    // Extract entries from the dataobject
    const olddata = Object.entries(dataobject);

    // Create a new ActionFormData for the main menu
    const form = new ActionFormData();
    form.title(`§cBug Reports`);
    form.body(`Here Are The Bug Reports\n\n${!olddata?.length ? '§cThere are No Bug Reports From Players\n\n' : ''}`);

    // Add buttons for each player with bug reports
    if (olddata.length > 0) olddata.map((value) => form.button(value[0], `textures/ui/Friend2`));

    // Add a Back button
    form.button('Back', `textures/ui/cancel`);

    // Show the main menu to the player
    form.show(player).then(({ selection }) => {
        if (!olddata[selection]) return AdminReportMenu(player);

        // Get the selected user and their bug reports
        const selecteduser = olddata[selection];

        // Create a new ActionFormData for the second menu
        const form = new ActionFormData();
        form.title(`${selecteduser[0]} Bugs`);
        form.body(`Select A Bug To View`);

        // Add buttons for each bug report
        selecteduser[1].map((value, index) => form.button(`§a${index + 1}§r: §c${value.ReportName}§r\n`, "textures/ui/debug_glyph_color"));

        // Add a Back button
        form.button('Back', `textures/ui/cancel`);

        // Show the second menu to the player
        form.show(player).then(({ selection }) => {
            if (!selecteduser[1][selection]) return AdminReportMenu(player);

            // Get the selected bug report
            const selectedbug = selecteduser[1][selection];

            // Create a new ActionFormData for the bug report details menu
            new ActionFormData()
                .title(`${selecteduser[0]}`)
                .body(`Report Details:\n${selectedbug.ReportDetails}\n\nReport Name: ${selectedbug.ReportName}\n\nTime Remaining: Days: ${getTime(selectedbug.endtime).days}, Hours: ${getTime(selectedbug.endtime).hours}, Minutes: ${getTime(selectedbug.endtime).minutes}\n\nReported By: ${selecteduser[0]}\n§aPress Leave Feedback To Notify The User This Report Has Been Resolved And Delete The Report`)
                .button('Leave Feedback', `textures/ui/check`)
                .button('Back', `textures/ui/cancel`)
                .show(player).then(({ selection }) => {
                    if (selection === 1) return AdminBugReports(player);

                    // Create a new ModalFormData for feedback
                    new ModalFormData()
                        .title(`§6Feedback On ${selectedbug.ReportName}`)
                        .textField('Leave A Message For The User', 'Thx For Reporting This Bug')
                        .toggle('Are you sure of this comment', false)
                        .show(player).then(({ formValues: [comment, Confirm] }) => {
                            if (!Confirm) return AdminReportMenu(player);

                            // Update ConfirmPlayer data
                            const confirmPlayerData = Database.has('ConfirmPlayer') ? JSON.parse(Database.get('ConfirmPlayer')) : {};
                            confirmPlayerData[selecteduser[0]] = [...(confirmPlayerData[selecteduser[0]] || []), { comment: comment, time: config.ReportTime }];

                            // Notify the reported player if online
                            const findplayer = world.getPlayers({ name: selecteduser[0] })[0];
                            if (findplayer) findplayer.sendMessage(`§6${selecteduser[0]} §aThe Report You Submitted Has Been Seen And Sorted By The Admins Comment left: ${comment}`);
                            else Database.set('ConfirmPlayer', JSON.stringify(confirmPlayerData));

                            // Remove the processed bug report from ReportBug
                            dataobject[selecteduser[0]] = dataobject[selecteduser[0]].filter(v => v.ReportName !== selectedbug.ReportName);

                            // Delete the entry if no bug reports are left for the user
                            if (dataobject[selecteduser[0]].length <= 0) delete dataobject[selecteduser[0]];

                            // Update ReportBug data in the database
                            Database.set('ReportBug', JSON.stringify(dataobject));

                            // Notify the admin
                            player.sendMessage('The Report Has Been Submitted To The Database');

                            // Log the updated dataobject for debugging purposes
                            console.warn(JSON.stringify(dataobject));
                        });
                });
        });
    });
}


// Admin Player report Menu
function AdminPlayerReport(player) {
    // Retrieve ReportPlayer data from the database, or initialize an empty object
    const dataobject = Database.has('ReportPlayer') ? JSON.parse(Database.get('ReportPlayer')) : {};

    // Extract entries from the dataobject
    const olddata = Object.entries(dataobject);

    // Create a new ActionFormData for the main menu
    const form = new ActionFormData()
    form.title(`§cPlayer Reports`);
    form.body(`Here Are The Player Reports\n\n${!olddata?.length ? '§cThere are No Reports \n\n' : ''}`);

    // Add buttons for each player with reports
    if (olddata.length > 0) olddata.map((value) => form.button(value[0], `textures/ui/Friend2`));

    // Add a Back button
    form.button('Back', `textures/ui/cancel`);

    // Show the main menu to the player
    form.show(player).then(({ canceled, selection }) => {
        if (canceled) return;

        // Check if a player is selected
        if (!olddata[selection]) return AdminReportMenu(player);

        // Get the selected user and their reports
        const selecteduser = olddata[selection];

        // Log the selected user's reports for debugging purposes
        console.warn(JSON.stringify(selecteduser[1]));

        // Create a new ActionFormData for the second menu
        const form = new ActionFormData();
        form.title(`${selecteduser[0]} Reports`);
        form.body(`Select A Report To View`);

        // Add buttons for each report
        selecteduser[1].map((value, index) => form.button(`§a${index + 1}§r: §c${value.ReportName}§r\n`, "textures/ui/debug_glyph_color"));

        // Add a Back button
        form.button('Back', `textures/ui/cancel`);

        // Show the second menu to the player
        form.show(player).then(({ canceled, selection }) => {
            if (canceled) return;

            // Check if a report is selected
            if (!selecteduser[1][selection]) return AdminReportMenu(player);

            // Get the selected report
            const selectedbug = selecteduser[1][selection];

            // Create a new ActionFormData for the report details menu
            new ActionFormData()
                .title(`${selecteduser[0]}`)
                .body(`Reported Player: ${selectedbug.PlayerName}\n\n\nReported For:  ${selectedbug.ReportName}\n\nReport Details: ${selectedbug.ReportDetails}\n\nTime Remaining: Days: ${getTime(selectedbug.endtime).days}, Hours: ${getTime(selectedbug.endtime).hours}, Minutes: ${getTime(selectedbug.endtime).minutes}\n\nReported By: ${selecteduser[0]}\n§aPress Leave Feedback To Notify The User This Report Has Been Resolved And Delete The Report`)
                .button('Leave Feedback', `textures/ui/check`)
                .button('Back', `textures/ui/cancel`)
                .show(player).then(({ selection }) => {
                    if (selection === 1) return AdminBugReports(player);

                    // Create a new ModalFormData for feedback
                    new ModalFormData()
                        .title(`§6Feedback On ${selectedbug.ReportName}`)
                        .textField('Leave A Message For The User', 'Thx For Reporting This Bug')
                        .toggle('Are you sure of this comment', false)
                        .show(player).then(({ formValues: [comment, Confirm] }) => {
                            if (!Confirm) return AdminReportMenu(player);

                            // Update ConfirmPlayer data
                            const confirmPlayerData = Database.has('ConfirmPlayer') ? JSON.parse(Database.get('ConfirmPlayer')) : {};
                            confirmPlayerData[selecteduser[0]] = [...(confirmPlayerData[selecteduser[0]] || []), { comment: comment, time: config.ReportTime }];

                            // Notify the reported player if online
                            const findplayer = world.getPlayers({ name: selecteduser[0] })[0];
                            if (findplayer) findplayer.sendMessage(`§6${selecteduser[0]} §aThe Report You Submitted Has Been Seen And Sorted By The Admins Comment left: ${comment}`);
                            else Database.set('ConfirmPlayer', JSON.stringify(confirmPlayerData));

                            // Remove the processed report from ReportPlayer
                            dataobject[selecteduser[0]] = dataobject[selecteduser[0]].filter(v => v.ReportName !== selectedbug.ReportName);

                            // Delete the entry if no reports are left for the user
                            if (dataobject[selecteduser[0]].length <= 0) delete dataobject[selecteduser[0]];

                            // Update ReportPlayer data in the database
                            Database.set('ReportPlayer', JSON.stringify(dataobject));

                            // Notify the admin
                            player.sendMessage('The Report Has Been Submitted To The Database');

                            // Log the updated dataobject for debugging purposes
                            console.warn(JSON.stringify(dataobject));
                        });
                });
        });
    });
}


// Event listener for player spawn to give the player the report comment
world.afterEvents.playerSpawn.subscribe((data) => {
    // Check if it's not the initial spawn
    if (!data.initialSpawn) return;

    // Retrieve ConfirmPlayer data from the database, or initialize an empty object
    const dataobject = Database.has('ConfirmPlayer') ? JSON.parse(Database.get('ConfirmPlayer')) : {};

    // Check if there are reports for the current player
    if (!dataobject[data.player.name]) return;

    // Iterate through each report for the player and send a message with the report comment
    dataobject[data.player.name]?.map((value) => data.player.sendMessage(`§6${data.player.name} §aThe Report You Submitted Has Been Seen And Sorted By the Admins Comment left: ${value.comment}`));

    // Log the data for debugging purposes
    console.warn(JSON.stringify(dataobject));

    // Remove processed reports for the player
    delete dataobject[data.player.name];

    // Update ConfirmPlayer data in the database
    Database.set('ConfirmPlayer', JSON.stringify(dataobject));
});

// Database cleanup and report filtering
system.runInterval(() => {
    // Define the keys for the relevant databases
    ['ReportPlayer', 'ConfirmPlayer', 'ReportBug'].forEach(key => {
        // Check if the database has the specified key
        if (!Database.has(key)) return;

        // Retrieve and parse data from the specified database
        let confirmPlayerData = JSON.parse(Database.get(key));

        // Iterate through each entry in the database
        Object.entries(confirmPlayerData).forEach(([reportId, reportArray]) => {
            // Filter out reports that have reached their endtime
            const filteredReports = reportArray.filter(report => !hasTimerReachedEnd(report.endtime?.targetDate));

            // Check if all reports have been filtered out, if yes, remove the entry
            filteredReports.length === 0 ? delete confirmPlayerData[reportId] : confirmPlayerData[reportId] = filteredReports;
        });

        // Update the database with the filtered data
        Database.set(key, JSON.stringify(confirmPlayerData));
    });
});