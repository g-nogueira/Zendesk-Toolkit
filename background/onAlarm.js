(() => {
    // ON ALARM
    chrome.alarms.onAlarm.addListener(async (alarm) => {
        if (alarm.name === ALARMS.RELOAD_ALL_TICKETS) {
            await updateBigWatchList();
        }
    });
})();
