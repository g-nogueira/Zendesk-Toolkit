"use strict";

(async () => {
    var tabs = new Tabby('[data-tabs]');

    // As soon as the browseraction opens, Clear badge notifications
    chrome.browserAction.setBadgeText({ text: "" });
    chrome.browserAction.setTitle({ title: "Zendesk Tookit" });

    // Set up QRious
    var qr = new QRious({ element: document.getElementById("qr") });
    qr.value = " ";
    qr.size = 200;

    // Set up HTML elements
    var HTMLElements = {
        inputs: {
            QRCodeURL: document.getElementById("qrUrl"),
            countryCodes: document.getElementById("countryCodes")
        },
        buttons: {
            reloadWatchList: document.getElementById("buttonReload"),
            clearNotifications: document.getElementById("buttonClear")
        },
        containers: {
            detailViewer: document.getElementById("detailViewContent"),
        },
        lists: {
            watchList: document.getElementById("ulWatchlist"),
            notificationList: document.getElementById("ulNotificationlist")
        }
    }


    reloadWatchList();
    reloadNotificationList();

    HTMLElements.buttons.reloadWatchList.addEventListener("click", () =>
        // Sends message to listener to update tickets
        chromeAsync.runtime.sendMessage({ action: MESSAGE_ACTIONS.UPDATE_ALL_TICKETS }).then(reloadWatchList)
    );
    HTMLElements.buttons.clearNotifications.addEventListener("click", async () =>
        notificationHelper.clearAllNotifications().then(reloadNotificationList)
    );

    HTMLElements.inputs.QRCodeURL.addEventListener("input", generateQrCode);

    function generateQrCode(e) {
        qr.value = e.target.value;
    }

    function toggleContent(el, forceState = null) {
        if (forceState === null) {
            el.classList.toggle("hidden");
        } else {
            if (forceState) {
                el.classList.remove("hidden");
            } else {
                el.classList.add("hidden");
            }
        }
    }

    async function reloadNotificationList() {
        var notificationList = await notificationHelper.getAllNotifications();

        // Retrieves <templates> elements
        var notificationListItem = document.querySelector('#notificationListItem');
        var notificationEmptyList = document.querySelector('#notificationEmptyList');

        // Cleans the <ul> children
        HTMLElements.lists.notificationList.innerHTML = "";

        if (notificationList.length === 0) {

            // Inserts "Empty List" in <ul>
            let node = notificationEmptyList.content.cloneNode(true);
            HTMLElements.lists.notificationList.appendChild(node);

        } else {

            // Calculates the date & time from three days ago
            let dateNow = new Date();
            let dateThreeDaysAgo = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() - 3, 0, 0, 0);

            // Filters notifications from three days ago until now
            notificationList = notificationList.filter((notification) => isTimestampOlderThanDate(notification.timestamp, dateThreeDaysAgo));

            notificationList.forEach((notification) => {
                // Sets up the <li> elements and its properties
                let node = notificationListItem.content.cloneNode(true);

                node.querySelector("#buttonPreview").dataset.detailId = notification.detailId;
                node.querySelector("#timestamp").innerHTML = notification.readableTimestamp
                node.querySelector("#message").innerHTML = `<a href="${notification.url}">${notification.message}</a>`;
                node.querySelector("#message").title = notification.message;

                node.querySelector("#buttonPreview").addEventListener("click", (e) => {
                    if (notification.ticketId && notification.detailId) {
                        toggleContent(HTMLElements.containers.detailViewer, true);
                        insertTicketComment(notification.ticketId, notification.detailId);
                    }
                });
                node.firstElementChild.dataset.timestamp = notification.timestamp;
                HTMLElements.lists.notificationList.appendChild(node);
            });
        }
    }

    async function insertTicketComment(ticketId, commentId) {
        HTMLElements.containers.detailViewer.innerHTML = "...";

        var response = await zendesk.api.ticketsComments(ticketId, commentId);

        if (response) {
            HTMLElements.containers.detailViewer.innerHTML = response.comments[0].html_body;
        }
    }

    function isTimestampOlderThanDate(timestampInMs, dateTime) {
        return (+timestampInMs) * 1000 > dateTime.getTime();
    }

    async function reloadWatchList() {
        var DBWatchList = await ticketHelper.getAllTickets("local");

        // Retrieves <templates> elements
        var ticketListItem = document.querySelector('#ticketListItem');
        var ticketEmptyList = document.querySelector('#ticketEmptyList');

        // Cleans the <ul> children
        HTMLElements.lists.watchList.innerHTML = "";

        if (DBWatchList.local.length === 0) {
            // Inserts "Empty List" in <ul>
            let node = ticketEmptyList.content.cloneNode(true);
            HTMLElements.lists.watchList.appendChild(node);

        } else {
            DBWatchList.local.forEach((ticket) => {
                // Sets up the <li> elements and its properties
                let node = ticketListItem.content.cloneNode(true);

                node.querySelector("#ticketId").innerHTML = "#" + ticket.id;
                node.querySelector("#buttonRemove").dataset.ticketId = ticket.id;
                node.querySelector("#ticketTitle").href = ticket.url;
                node.querySelector("#ticketPriority").innerText = ticket.zendeskTicket.priority;
                node.querySelector("#ticketStatus").innerText = ticket.zendeskTicket.status;
                node.querySelector("#ticketStatus").classList.add("ticket-status-" + ticket.zendeskTicket.status);
                node.querySelector("#ticketTitle").innerHTML = ticket.subject;
                node.querySelector("#ticketTitle").title = ticket.subject;
                node.querySelector("#ticketTitle").addEventListener("click", requestOpenTicket);
                node.querySelector("#buttonRemove").addEventListener("click", removeTicketFromWatchList);

                node.firstElementChild.dataset.ticketId = ticket.id;
                HTMLElements.lists.watchList.appendChild(node);
            });
        }
    }

    function removeTicketFromWatchList(e) {
        var ticketId = e.target.dataset.ticketId;
        if (ticketId) {
            ticketHelper.removeFromWatchList(ticketId).then(reloadWatchList);
        }
    }

    async function requestOpenTicket(e) {
        var activeTab = await chromeAsync.tabs.getActive();

        chromeAsync.tabs.sendMessage(activeTab[0].id, {
            action: MESSAGE_ACTIONS.OPEN_TICKET, ticket: {
                url: e.target.href,
                id: e.target.parentElement.dataset.ticketId
            }
        });
    }



})();