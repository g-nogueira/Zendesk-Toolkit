var filepath = [];
var url = "";
var intervalReloadWatchingTickets = 5;

chromeAsync.storage.sync.get(STORAGE_KEYS.FILEPATH).then((result) => {
    filepath = result[STORAGE_KEYS.FILEPATH];
});

chromeAsync.storage.sync.get(STORAGE_KEYS.URL).then((result) => {
    url = result[STORAGE_KEYS.URL];
});

chromeAsync.storage.sync.get(STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS).then((result) => {
    intervalReloadWatchingTickets = result[STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS];
});


chrome.storage.onChanged.addListener(async (changes, namespace) => {
    for (var key in changes) {

        var changedStorage = changes[key];

        if (key === STORAGE_KEYS.FILEPATH) {

            filepath = changedStorage.newValue;
        }
        else if (key === STORAGE_KEYS.URL) {

            url = changedStorage.newValue;
        }
        else if (key === STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS) {

            intervalReloadWatchingTickets = changedStorage.newValue;
            createAlarm(ALARMS.RELOAD_ALL_TICKETS, Date.now() + 5000, intervalReloadWatchingTickets);
        }
    }

});

function createAlarm(name, when, periodInMinutes) {
    // CREATE ALARMS
    chrome.alarms.create(name, {
        when: when || Date.now() + 2000,
        periodInMinutes: +periodInMinutes
    });
}