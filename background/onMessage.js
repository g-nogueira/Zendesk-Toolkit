// ON MESSAGE
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === MESSAGE_ACTIONS.WATCH_TICKET) {
        ticketHelper.addToWatchList(request.ticket.id, request.ticket.title, request.ticket.url);
    } else if (request.action === MESSAGE_ACTIONS.UPDATE_ALL_TICKETS) {
        updateBigWatchList().then(sendResponse);
        return true;
    }
});