const ticketHelper = {

    getAgentUrl(ticketId) {
        return "https://supportoutsystems.zendesk.com/agent/tickets/" + ticketId
    },

    async addToWatchList(ticketId) {
        var tickets = await this.getAllTickets();
        var ticket = await this.getTicket(ticketId);

        tickets.local.push(ticket.local);
        tickets.sync.push(ticket.sync);

        chromeAsync.storage.local.set({ [STORAGE_KEYS.WATCHING_TICKETS]: tickets.local });
        chromeAsync.storage.sync.set({ [STORAGE_KEYS.WATCHING_TICKETS]: tickets.sync });

        return ticket;
    },

    async removeFromWatchList(ticketId = -1) {
        var tickets = await this.getAllTickets();

        // Returns only the tickets that are different from the one inputed
        tickets.sync = tickets.sync.filter((ticket) => +ticket.id !== +ticketId);
        tickets.local = tickets.local.filter((ticket) => +ticket.id !== +ticketId);

        var promises = [
            chromeAsync.storage.local.set({ [STORAGE_KEYS.WATCHING_TICKETS]: tickets.local }),
            chromeAsync.storage.sync.set({ [STORAGE_KEYS.WATCHING_TICKETS]: tickets.sync })
        ]

        return Promise.all(promises);
    },

    async isOnWatchList(ticketId = -1) {
        var tickets = await this.getAllTickets("sync");

        return tickets.sync.some((ticket) => +ticketId === +ticket.id);
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

        if (Number.isInteger(+id)) {
            id = +id;
        }

        var response = { sync: {}, local: {} };
        var zendeskTicket = await zendesk.api.tickets(id);
        var ticketComments = await zendesk.api.ticketsComments(id);

        if (!zendeskTicket) {
            return null;
        }

        zendeskTicket = zendeskTicket.ticket;

        // Most recent public and private comments
        let lastPublicComment = ticketComments.comments.filter((comment) => comment.public).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        // let lastPrivateComment = ticketComments.comments.filter((comment) => !comment.public).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

        // Date of the comment in milliseconds
        let lastPublicCommentTimestamp = (new Date(lastPublicComment.created_at)).getTime();

        // Sets the local ticket
        response.local = {
            id,
            subject: zendeskTicket.subject,
            url: this.getAgentUrl(id),
            lastPublicComment: lastPublicCommentTimestamp,
            zendeskTicket: zendeskTicket,
            isMine = +zendeskTicket.assignee_id === +ZENDESK_MY_USERID
        };

        // Sets the sync ticket
        response.sync = { id };

        return response;
    }

}