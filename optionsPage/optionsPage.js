"use strict";

(async () => {
    var form_options = document.getElementById("options");
    var input_filepath = document.getElementById("filepath");
    var input_url = document.getElementById("condition_urlincludes");
    var input_fileextensions = document.getElementById("fileextensions");
    var input_intervalReloadWatchingTickets = document.getElementById("intervalReloadWatchingTickets");
    var input_backupFile = document.getElementById("backupFile");
    var button_backupStorage = document.getElementById("backupStorage");
    var button_restoreStorage = document.getElementById("restoreStorage");

    form_options.addEventListener("change", saveChanges);
    button_backupStorage.addEventListener("click", backupStorage);
    button_restoreStorage.addEventListener("click", restoreStorage);

    input_filepath.value = (await chromeAsync.storage.sync.get(STORAGE_KEYS.FILEPATH))[STORAGE_KEYS.FILEPATH];
    input_url.value = (await chromeAsync.storage.sync.get(STORAGE_KEYS.URL))[STORAGE_KEYS.URL];
    input_fileextensions.value = (await chromeAsync.storage.sync.get(STORAGE_KEYS.FILE_EXTENSIONS))[STORAGE_KEYS.FILE_EXTENSIONS];
    input_intervalReloadWatchingTickets.value = (await chromeAsync.storage.sync.get(STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS))[STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS];


    async function backupStorage() {
        var keys = [];
        var storage = {};

        for (const key in STORAGE_KEYS) {
            keys.push(STORAGE_KEYS[key]);
        }

        storage.sync = await chromeAsync.storage.sync.get(keys);
        storage.local = await chromeAsync.storage.local.get(keys);
        downloadFile("ZendestToolkit_" + Date.now(), JSON.stringify(storage));
    }

    async function restoreStorage(e) {
        e.target.value = "Loading...";

        try {
            var file = input_backupFile.files[0];
            var fileContent = await readFile(file);
            var storage = JSON.parse(fileContent);

            await chromeAsync.storage.sync.set(storage.sync);
            await chromeAsync.storage.local.set(storage.local);

            window.location.reload();
        } catch (error) {
            e.target.value = "Error: " + error.message;
            notificationHelper.addToNotifications({ message: error.message });

            setTimeout(() => {
                window.location.reload();
            }, 1500);

        }
    }


    function saveChanges(e) {
        saveFilepath();
        saveUrl();
        saveFileExtension();
        saveIntervalWatchingTickets();
    }

    function saveFilepath() {
        chromeAsync.storage.sync.set({ [STORAGE_KEYS.FILEPATH]: input_filepath.value });
    }

    function saveUrl() {
        chromeAsync.storage.sync.set({ [STORAGE_KEYS.URL]: input_url.value.split(",") });
    }

    function saveFileExtension() {
        chromeAsync.storage.sync.set({ [STORAGE_KEYS.FILE_EXTENSIONS]: input_fileextensions.value.split(",") });
    }

    function saveIntervalWatchingTickets() {
        chromeAsync.storage.sync.set({ [STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS]: input_intervalReloadWatchingTickets.value });
    }

    function downloadFile(filename, text) {
        var file = new Blob([text], {
            type: "text/plain"
        });
        var element = document.createElement("a");
        element.download = filename;
        element.href = window.URL.createObjectURL(file);
        element.target = "_blank";
        element.click();
    }

    function readFile(file) {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.addEventListener("load", (event) => {
                let result = event.target.result;
                resolve(result);
            });

            reader.addEventListener("progress", (event) => {
                if (event.loaded && event.total) {
                    const percent = (event.loaded / event.total) * 100;
                    console.log(`Progress: ${Math.round(percent)}`);
                }
            });

            reader.readAsText(file);

        });

    }

})();