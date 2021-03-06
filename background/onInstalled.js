// ON INSTALLED
chrome.runtime.onInstalled.addListener((details) => {

    if (details.reason === "install") {
        chromeAsync.storage.sync.set({
            [STORAGE_KEYS.WATCHING_TICKETS]: STORAGE_DEFAULTS[STORAGE_KEYS.WATCHING_TICKETS],
            [STORAGE_KEYS.NOTIFICATIONS]: STORAGE_DEFAULTS[STORAGE_KEYS.NOTIFICATIONS],
            [STORAGE_KEYS.FILEPATH]: STORAGE_DEFAULTS[STORAGE_KEYS.FILEPATH],
            [STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS]: STORAGE_DEFAULTS[STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS],
            [STORAGE_KEYS.URL]: STORAGE_DEFAULTS[STORAGE_KEYS.URL],
            [STORAGE_KEYS.FILE_EXTENSIONS]: STORAGE_DEFAULTS[STORAGE_KEYS.FILE_EXTENSIONS],
            [STORAGE_KEYS.TICKET_REMINDER]: STORAGE_DEFAULTS[STORAGE_KEYS.TICKET_REMINDER]
        });

        chromeAsync.storage.local.set({
            [STORAGE_KEYS.WATCHING_TICKETS]: STORAGE_DEFAULTS[STORAGE_KEYS.WATCHING_TICKETS]
        });

        createAlarm(ALARMS.RELOAD_ALL_TICKETS, Date.now() + 2000, STORAGE_DEFAULTS[STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS]);
    }
});