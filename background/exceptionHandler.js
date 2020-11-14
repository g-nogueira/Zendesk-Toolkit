(() => {
    // window.addEventListener("error", ({ message, filename, lineno, colno, error }) => {
    //     let fullMessage = ["An error occurred with message: " + message,
    //     "On file: " + filename,
    //     "Line: " + lineno,
    //     "Column: " + colno,
    //     "Error: " + JSON.stringify(error)].join("\n");

    //     notificationHelper.addToNotifications({ message: fullMessage });
    // });

    // chrome.tabs.executeScript(null, null, function () {
    //     if (chrome.runtime.lastError) {
    //         var errorMsg = chrome.runtime.lastError.message;

    //         notificationHelper.addToNotifications({ message: errorMsg });
    //         if (errorMsg == "Cannot access a chrome:// URL") {
    //             // Error handling here
    //         }
    //     }
    // })
})();