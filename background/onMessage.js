// ON MESSAGE
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === MESSAGE_ACTIONS.WATCH_TICKET) {
        ticketHelper.addToWatchList(request.zendeskTicket.id, request.zendeskTicket.subject, request.zendeskTicket.url);
    } else if (request.action === MESSAGE_ACTIONS.UPDATE_ALL_TICKETS) {
        updateBigWatchList().then(sendResponse);
        return true;
    }
});