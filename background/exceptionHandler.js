(() => {
    window.addEventListener("error", ({ message, filename, lineno, colno, error }) => {
        let fullMessage = ["An error occurred with message: " + message,
        "On file: " + filename,
        "Line: " + lineno,
        "Column: " + colno,
        "Error: " + JSON.stringify(error)].join("\n");

        notificationHelper.addToNotifications({ message: fullMessage });
    });
})();