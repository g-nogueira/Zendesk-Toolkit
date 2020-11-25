refreshContextMenu();

function createAlarm(name, when, periodInMinutes) {
    // CREATE ALARMS
    chrome.alarms.create(name, {
        when: when || Date.now() + 2000,
        periodInMinutes: +periodInMinutes
    });
}

function refreshContextMenu() {
    var parentId = chrome.contextMenus.create({
        title: "Zendesk Tookit",
        contexts: ["page", "selection"]
    });

    chrome.contextMenus.create({
        title: "Watch Ticket",
        parentId: parentId,
        onclick: addTicketToWatchList
    });

    chrome.contextMenus.create({
        title: "Remind Me",
        parentId: parentId,
        contexts: ["selection"],
        onclick: createTicketReminder
    });
}

async function createTicketReminder(info, tab) {
    // Ex: "Call customer on 11/23/2020 16:15"
    // Match [1] "Call customer "
    // Match [2] "11/23/2020 16:15"
    var selection = info.selectionText.match(/(.+)\s([0-9]{2}\/[0-9]{2}\/[0-9]{4}\s{1}[0-9]{2}:[0-9]{2})/);

    var description = selection[1];
    var date = new Date(selection[2]);

    ticketHelper.createOrUpdateReminder({
        ticketId: /[tickets]\/([0-9]+)/.exec(tab.url)[1],
        description,
        when: date.getTime()
    });

}

async function addTicketToWatchList(info, tab) {
    var ticketId = /[tickets]\/([0-9]+)/.exec(tab.url)[1];
    var ticketURL = ticketHelper.getAgentUrl(ticketId);

    // Only proceeds if the ticket is not already in the watchList
    if (!(await ticketHelper.isOnWatchList(ticketId))) {
        let ticket = await ticketHelper.addToWatchList(ticketId);

        // Builds and displays a notification
        let title = String.format(
            MESSAGE_TEMPLATES.WATCHING_TICKET,
            ticketId,
            ticket.local.zendeskTicket.subject
        );

        notificationHelper.log({
            message: title,
            url: ticket.local.url
        });

    } else {

        // Builds and displays a notification
        let title = String.format(
            MESSAGE_TEMPLATES.ALREADY_WATCHING_TICKET,
            ticketId,
        );

        notificationHelper.log({
            message: title,
            url: ticketURL
        });
    }

}

/**
 * Synchronizes local data with Zendesk server.
 *
 * @returns
 */
async function syncTickets() {
    var tikets = await ticketHelper.getAllTickets("local");

    tikets.local = tikets.local.map(async (ticket) => {

        var updatedTicket = await ticketHelper.getTicket(ticket.id);

        if (updatedTicket === null) {
            return ticket;
        }

        // Track a change in status
        let oldStatus = ticket.zendeskTicket.status;
        let newStatus = updatedTicket.local.zendeskTicket.status;

        // Get the most recent and public comment
        let oldCommentOn = +ticket.lastPublicComment || null;
        let newCommentOn = +updatedTicket.local.lastPublicComment;

        if (oldStatus !== newStatus) {

            // Builds and displays a notification for status changed
            var title = String.format(
                MESSAGE_TEMPLATES.TICKET_STATUS_CHANGED,
                ticket.id,
                ticket.subject,
                oldStatus.toUpperCase(),
                newStatus.toUpperCase()
            );

            notificationHelper.notify("Ticket Status Changed", title);
            await notificationHelper.log({
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

            notificationHelper.notify("Ticket New Comment", title);
            await notificationHelper.log({
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

        Promise.all(tikets.local).then((result) => {
            chromeAsync.storage.local.set({ [STORAGE_KEYS.WATCHING_TICKETS]: result }).then(resolve);
        });
    });
}

