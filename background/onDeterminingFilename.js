(() => {
    var filepath, url;

    chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
        if (url.some((url) => (new RegExp(url)).exec(item.url))) {
            suggest({ filename: getFilename(filepath, getTicketIdByFinalUrl(item.finalUrl), item.filename) });
        }
    });

    chromeAsync.storage.sync.get(STORAGE_KEYS.FILEPATH).then((response) => {
        filepath = response[STORAGE_KEYS.FILEPATH];
    });

    chromeAsync.storage.sync.get(STORAGE_KEYS.URL).then((response) => {
        url = response[STORAGE_KEYS.URL];
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
        }

    });

    function getFilename(filepath, ticketId, filename) {
        var datetime = new Date();
        var _filepath = filepath
            .replace(/<ticket_id>/g, ticketId)
            .replace(/<file_name>/g, filename)
            .replace(/<date>/g, `${datetime.getUTCFullYear()}${datetime.getUTCMonth()}${datetime.getUTCDay()}`)
            .replace(/<time>/g, `${datetime.getUTCHours()}${datetime.getUTCMinutes()}${datetime.getUTCSeconds()}`);

        return _filepath;
    }

    function getTicketIdByFinalUrl(url) {
        const _url = new URL(url);
        return /cases\/([0-9]+)/gi.exec(_url.pathname)[1];
    }
})();