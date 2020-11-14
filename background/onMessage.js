// ON MESSAGE
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === MESSAGE_ACTIONS.UPDATE_ALL_TICKETS) {
        syncTickets().then(sendResponse);
        return true;
    }
});