(() => {
    // ON ALARM
    chrome.alarms.onAlarm.addListener(async (alarm) => {
        if (alarm.name === ALARMS.RELOAD_ALL_TICKETS) {
            await syncTickets();
        }

        else if (alarm.name.includes(String.format(ALARMS.TICKET_REMINDER, ""))) {
            var reminderId = alarm.name.match(/ticketReminder_([0-9]+)/)[1];
            var reminder = await ticketHelper.getReminder(reminderId);
            
            notificationHelper.log({
                message: reminder.description,
                url: ticketHelper.getAgentUrl(reminder.ticketId)
            });
            notificationHelper.notify("Reminder...", reminder.description);
        }
    });

    chrome.storage.onChanged.addListener(async (changes, namespace) => {
        for (var key in changes) {

            var changedStorage = changes[key];

            if (key === STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS) {
                createAlarm(ALARMS.RELOAD_ALL_TICKETS, Date.now() + 5000, +changedStorage.newValue);
            }
        }

    });
})();
