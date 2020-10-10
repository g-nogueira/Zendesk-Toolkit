const ticketHelper = {

    getAgentUrl(ticketId) {
        return "https://supportoutsystems.zendesk.com/agent/tickets/" + ticketId
    },

    async addToWatchList(ticketId, title, url, zendeskTicket = null) {
        var tinyWatchList = await chromeAsync.storage.sync.get(STORAGE_KEYS.WATCHING_TICKETS);
        var bigWatchList = await chromeAsync.storage.local.get(STORAGE_KEYS.WATCHING_TICKETS);
        tinyWatchList = tinyWatchList[STORAGE_KEYS.WATCHING_TICKETS];
        bigWatchList = bigWatchList[STORAGE_KEYS.WATCHING_TICKETS];

        var tinyTicket = { id: ticketId, title, url };
        var bigTicket = { id: ticketId, title, url, ticket: zendeskTicket };


        tinyWatchList.push(tinyTicket);
        bigWatchList.push(bigTicket);


        chromeAsync.storage.local.set({ [STORAGE_KEYS.WATCHING_TICKETS]: bigWatchList });
        return chromeAsync.storage.sync.set({ [STORAGE_KEYS.WATCHING_TICKETS]: tinyWatchList });
    },

    async removeFromWatchList(ticketId = -1) {
        var tinyWatchList = await chromeAsync.storage.sync.get(STORAGE_KEYS.WATCHING_TICKETS);
        var bigWatchList = await chromeAsync.storage.local.get(STORAGE_KEYS.WATCHING_TICKETS);

        tinyWatchList = tinyWatchList[STORAGE_KEYS.WATCHING_TICKETS].filter((ticket) => {
            return ticket.id !== ticketId;
        });

        bigWatchList = bigWatchList[STORAGE_KEYS.WATCHING_TICKETS].filter((ticket) => {
            return ticket.id !== ticketId;
        });

        chromeAsync.storage.local.set({ [STORAGE_KEYS.WATCHING_TICKETS]: bigWatchList });
        return chromeAsync.storage.sync.set({ [STORAGE_KEYS.WATCHING_TICKETS]: tinyWatchList });
    },

    async isOnWatchList(ticketId = -1) {
        var watchList = await chromeAsync.storage.sync.get(STORAGE_KEYS.WATCHING_TICKETS);

        return watchList[STORAGE_KEYS.WATCHING_TICKETS].some((ticket) => ticketId == ticket.id);
    },

    async getAllFromWatchList(smallWatchList = false) {
        var watchList = [];
        if (smallWatchList) {
            watchList = await chromeAsync.storage.sync.get(STORAGE_KEYS.WATCHING_TICKETS);
        } else {
            watchList = await chromeAsync.storage.local.get(STORAGE_KEYS.WATCHING_TICKETS);
        }
        return watchList[STORAGE_KEYS.WATCHING_TICKETS];
    },

}