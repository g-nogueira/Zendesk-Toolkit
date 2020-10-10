// ON INSTALLED
chrome.runtime.onInstalled.addListener((details) => {

    if (details.reason === "install") {
        // If storage is empty, set it as empty array
        chromeAsync.storage.sync.set({
            [STORAGE_KEYS.WATCHING_TICKETS]: STORAGE_DEFAULTS[STORAGE_KEYS.WATCHING_TICKETS],
            [STORAGE_KEYS.NOTIFICATIONS]: STORAGE_DEFAULTS[STORAGE_KEYS.NOTIFICATIONS],
            [STORAGE_KEYS.FILEPATH]: STORAGE_DEFAULTS[STORAGE_KEYS.FILEPATH],
            [STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS]: STORAGE_DEFAULTS[STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS],
            [STORAGE_KEYS.URL]: STORAGE_DEFAULTS[STORAGE_KEYS.URL],
            [STORAGE_KEYS.FILE_EXTENSIONS]: STORAGE_DEFAULTS[STORAGE_KEYS.FILE_EXTENSIONS]
        });

        // If storage is empty, set it as empty array
        chromeAsync.storage.local.get([STORAGE_KEYS.WATCHING_TICKETS]).then((objects) => {
            if (!Array.isArray(objects[STORAGE_KEYS.WATCHING_TICKETS])) {
                chromeAsync.storage.local.set({ [STORAGE_KEYS.WATCHING_TICKETS]: STORAGE_DEFAULTS[STORAGE_KEYS.WATCHING_TICKETS] });
            }
        });

        createAlarm(ALARMS.RELOAD_ALL_TICKETS, Date.now() + 2000, intervalReloadWatchingTickets || STORAGE_DEFAULTS.INTERVAL_RELOAD_WATCHING_TICKETS);
    }
});