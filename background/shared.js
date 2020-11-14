refreshContextMenu();

function createAlarm(name, when, periodInMinutes) {
    // CREATE ALARMS
    chrome.alarms.create(name, {
        when: when || Date.now() + 2000,
        periodInMinutes: +periodInMinutes
    });
}

async function addTicketToWatchList(info, tab) {
    var ticketId = /[tickets]\/([0-9]+)/.exec(tab.url)[1];
    var ticketURL = ticketHelper.getAgentUrl(ticketId);

    if (!(await ticketHelper.isOnWatchList(ticketId))) {
        let ticket = await ticketHelper.addToWatchList(ticketId, zendeskTicket.subject, ticketURL, zendeskTicket);

        let title = String.format(
            MESSAGE_TEMPLATES.WATCHING_TICKET,
            ticketId,
            ticket.local.zendeskTicket.subject
        );
        notificationHelper.addToNotifications({
            message: title,
            url: ticketURL
        });

    } else {

        let title = String.format(
            MESSAGE_TEMPLATES.ALREADY_WATCHING_TICKET,
            ticketId,
        );
        notificationHelper.addToNotifications({
            message: title,
            url: ticketURL
        });
    }

}

/**
 * Synchronizes the local and sync tickets with the server.
 *
 * @returns
 */
async function syncTickets() {
    var bigWatchList = await ticketHelper.getAllTickets("local");

    bigWatchList.local = bigWatchList.local.map(async (ticket) => {

        var updatedTicket = await ticketHelper.getTicket(ticket.id);

        if (updatedTicket === null) {
            return ticket;
        }

        let oldStatus = ticket.zendeskTicket.status;
        let newStatus = updatedTicket.local.zendeskTicket.status;

        // Get the most recent and public comment
        let oldCommentOn = +ticket.lastPublicComment || null;
        let newCommentOn = +updatedTicket.local.lastPublicComment;

        if (oldStatus !== newStatus) {

            var title = String.format(
                MESSAGE_TEMPLATES.TICKET_STATUS_CHANGED,
                ticket.id,
                ticket.subject,
                oldStatus.toUpperCase(),
                newStatus.toUpperCase()
            );

            notificationHelper.addSystemTrayNotification("Ticket Status Changed", title);
            await notificationHelper.addToNotifications({
                message: title,
                url: ticket.url,
                ticketId: ticket.id
            });
        }

        // Notifies only new comments
        if (oldCommentOn !== null && oldCommentOn !== newCommentOn) {

            let ticketComments = await zendesk.api.ticketsComments(ticket.id);
            let newComment = ticketComments.comments.filter((comment) => comment.public).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];


            var title = String.format(
                MESSAGE_TEMPLATES.TICKET_NEW_COMMENT,
                ticket.id,
                ticket.subject
            );

            notificationHelper.addSystemTrayNotification("Ticket New Comment", title);
            await notificationHelper.addToNotifications({
                message: title,
                url: ticket.url,
                ticketId: ticket.id,
                detailId: newComment.id
            });
        }


        ticket = updatedTicket.local;

        return ticket;
    });

    return new Promise((resolve, reject) => {

        Promise.all(bigWatchList.local).then((result) => {
            chromeAsync.storage.local.set({ [STORAGE_KEYS.WATCHING_TICKETS]: result }).then(resolve);
        });
    });
}

function refreshContextMenu() {
    var parentId = chrome.contextMenus.create({
        title: "Zendesk Tookit",
        contexts: ["page"]
    });

    chrome.contextMenus.create({
        title: "Watch Ticket",
        parentId: parentId,
        onclick: addTicketToWatchList
    });
}