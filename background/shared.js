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
        var bigTicket = (await zendesk.api.tickets(ticketId)).ticket;
        ticketHelper.addToWatchList(ticketId, bigTicket.subject, ticketURL, bigTicket);
    }

    let title = String.format(
        MESSAGE_TEMPLATES.WATCHING_TICKET,
        ticketId,
        bigTicket.subject
    );
    notificationHelper.appendToBrowserActionTitle(title);
    notificationHelper.addToNotifications({
        message: title,
        url: ticketURL
    });
}

async function updateBigWatchList() {
    var bigWatchList = await ticketHelper.getAllFromWatchList();

    bigWatchList = bigWatchList.map(async (ticket) => {

        let bigTicket = await zendesk.api.tickets(ticket.id);

        if (!bigTicket) {
            return ticket;
        }

        bigTicket = bigTicket.ticket;
        let oldStatus = ticket.ticket.status || "";
        let newStatus = bigTicket.status;

        if (bigTicket && oldStatus !== newStatus) {

            var title = String.format(
                MESSAGE_TEMPLATES.TICKET_STATUS_CHANGED,
                ticket.id,
                ticket.title,
                oldStatus.toUpperCase(),
                newStatus.toUpperCase(),
                ticket.url
            );

            notificationHelper.appendToBrowserActionTitle(title);
            notificationHelper.addSystemTrayNotification("Ticket Status Changed", title);
            notificationHelper.addToNotifications({
                message: title,
                url: ticket.url
            });
        }


        ticket.ticket = bigTicket || ticket.ticket;

        return ticket;
    });

    return new Promise((resolve, reject) => {

        Promise.all(bigWatchList).then((result) => {
            chromeAsync.storage.local.set({ [STORAGE_KEYS.WATCHING_TICKETS]: result }).then(resolve);
        });
    });
}

async function updateSmallWatchList() {
    var smallWatchList = await ticketHelper.getAllFromWatchList(true);
    var bigWatchList = await ticketHelper.getAllFromWatchList();

    var smallWatchList = smallWatchList.map((smallTicket) => {

        let bigTicket = bigWatchList.find((bigTicket) => bigTicket.id === smallTicket.id);

        if (!bigTicket) {
            return smallTicket;
        }

        smallTicket.priority = bigTicket.ticket.priority;
        smallTicket.ticket = null;

        return smallTicket;
    });

    return new Promise((resolve, reject) => {

        chromeAsync.storage.sync.set({ [STORAGE_KEYS.WATCHING_TICKETS]: smallWatchList }).then(resolve);
    });
}

function refreshContextMenu() {
    var parentId = chrome.contextMenus.create({
        title: "Zendesk Multitool",
        contexts: ["page"]
    });

    chrome.contextMenus.create({
        title: "Watch Ticket",
        parentId: parentId,
        onclick: addTicketToWatchList
    });
}