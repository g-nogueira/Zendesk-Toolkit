const ticketHelper = {

    getAgentUrl(ticketId) {
        return "https://supportoutsystems.zendesk.com/agent/tickets/" + ticketId
    },

    async addToWatchList(ticketId, subject, url, zendeskTicket = null) {
        var tinyWatchList = await chromeAsync.storage.sync.get(STORAGE_KEYS.WATCHING_TICKETS);
        var bigWatchList = await chromeAsync.storage.local.get(STORAGE_KEYS.WATCHING_TICKETS);
        tinyWatchList = tinyWatchList[STORAGE_KEYS.WATCHING_TICKETS];
        bigWatchList = bigWatchList[STORAGE_KEYS.WATCHING_TICKETS];

        var tinyTicket = { id: ticketId, subject, url };
        var bigTicket = { id: ticketId, subject, url, zendeskTicket };


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

    /**
     * Returns all tickets from the extension's storage.
     *
     * @param {"sync"|"local"} [storageType=null]
     * @returns
     */
    async getAllTickets(storageType = null) {
        var watchList = {};

        if (storageType === null) {

            watchList.local = await chromeAsync.storage.local.get(STORAGE_KEYS.WATCHING_TICKETS);
            watchList.sync = await chromeAsync.storage.sync.get(STORAGE_KEYS.WATCHING_TICKETS);
            watchList.local = watchList.local[STORAGE_KEYS.WATCHING_TICKETS]
            watchList.sync = watchList.sync[STORAGE_KEYS.WATCHING_TICKETS]

        } else if (storageType === "sync") {

            watchList.sync = await chromeAsync.storage.sync.get(STORAGE_KEYS.WATCHING_TICKETS);
            watchList.sync = watchList.sync[STORAGE_KEYS.WATCHING_TICKETS]

        } else if (storageType === "local") {

            watchList.local = await chromeAsync.storage.local.get(STORAGE_KEYS.WATCHING_TICKETS);
            watchList.local = watchList.local[STORAGE_KEYS.WATCHING_TICKETS]

        }

        return watchList;
    },

    /**
     * Retrieves a ticket from Zendesk API, managing it according the extension's architecture.
     *
     * @param {number|string} id
     * @returns
     */
    async getTicket(id) {
        var response = {
            sync: {},
            local: {}
        };

        let zendeskTicket = await zendesk.api.tickets(id);
        let ticketComments = await zendesk.api.ticketsComments(id);

        if (!zendeskTicket) {
            return null;
        }

        zendeskTicket = zendeskTicket.ticket;

        // Most recent public and private comments
        let lastPublicComment = ticketComments.comments.filter((comment) => comment.public).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        let lastPrivateComment = ticketComments.comments.filter((comment) => !comment.public).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

        // Date of the comment in milliseconds
        let lastPublicCommentTimestamp = (new Date(lastPublicComment.created_at)).getTime();

        response.local = {
            id: zendeskTicket.id,
            subject: zendeskTicket.subject,
            url: zendeskTicket.url,
            lastPublicComment: lastPublicCommentTimestamp,
            zendeskTicket: zendeskTicket
        };

        response.sync = {
            id: zendeskTicket.id,
            subject: zendeskTicket.subject,
            url: zendeskTicket.url
        };

        // Track if ticket is assigned to user using extension
        if (zendeskTicket && zendeskTicket.assignee_id === +ZENDESK_MY_USERID) {
            response.local.isMine = true;
        }

        return response;
    }

}