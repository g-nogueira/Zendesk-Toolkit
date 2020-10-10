(() => {
    // ON ALARM
    chrome.alarms.onAlarm.addListener(async (alarm) => {
        if (alarm.name === ALARMS.RELOAD_ALL_TICKETS) {
            await updateBigWatchList();
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
