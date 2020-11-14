const notificationHelper = {
    /**
     *
     *
     * @param {object} object
     * @param {string} object.message
     * @param {string} object.url
     */
    async notify(object, increaseBadgeCount = true) {
        return new Promise(async (resolve, reject) => {

            var notifications = await chromeAsync.storage.sync.get(STORAGE_KEYS.NOTIFICATIONS);
            var unixTimestamp = Math.round((new Date()).getTime() / 1000);

            notifications = notifications[STORAGE_KEYS.NOTIFICATIONS];

            notifications.push({
                timestamp: Math.round((new Date()).getTime() / 1000),
                readableTimestamp: (new Date(unixTimestamp * 1000)).toLocaleString(),
                message: object.message,
                url: object.url || "",
                detailId: object.detailId,
                ticketId: object.ticketId
            });

            await chromeAsync.storage.sync.set({ [STORAGE_KEYS.NOTIFICATIONS]: notifications });

            if (increaseBadgeCount) {
                await this.appendToBrowserActionTitle(object.message);
            }

            resolve();
        });

    },

    async appendToBrowserActionTitle(message) {
        return new Promise((resolve, reject) => {
            chromeAsync.browserAction.increaseBadgeCount();
            chromeAsync.browserAction.increaseTitle({ title: message }).then(resolve);
        });
    },

    addSystemTrayNotification(title, message) {
        chrome.notifications.create("", { type: "basic", iconUrl: "./icon_test.png", title, message });
    },

    async getAllNotifications() {
        var notificationList = await chromeAsync.storage.sync.get(STORAGE_KEYS.NOTIFICATIONS);
        return notificationList[STORAGE_KEYS.NOTIFICATIONS];
    },

    async clearAllNotifications() {
        var result = await chromeAsync.storage.sync.set({ [STORAGE_KEYS.NOTIFICATIONS]: [] });
        return result;
    }

}