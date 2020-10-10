(() => {
    chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
        if (url.some((url) => (new RegExp(url)).exec(item.url))) {
            suggest({ filename: getFilename(filepath, getTicketIdByFinalUrl(item.finalUrl), item.filename) });
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