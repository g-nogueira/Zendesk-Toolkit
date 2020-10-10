"use strict";

(async () => {
    var form_options = document.getElementById("options");
    var input_filepath = document.getElementById("filepath");
    var input_url = document.getElementById("condition_urlincludes");
    var input_fileextensions = document.getElementById("fileextensions");
    var input_intervalReloadWatchingTickets = document.getElementById("intervalReloadWatchingTickets");

    form_options.addEventListener("change", saveChanges);

    input_filepath.value = (await chromeAsync.storage.sync.get(STORAGE_KEYS.FILEPATH))[STORAGE_KEYS.FILEPATH];
    input_url.value = (await chromeAsync.storage.sync.get(STORAGE_KEYS.URL))[STORAGE_KEYS.URL];
    input_fileextensions.value = (await chromeAsync.storage.sync.get(STORAGE_KEYS.FILE_EXTENSIONS))[STORAGE_KEYS.FILE_EXTENSIONS];
    input_intervalReloadWatchingTickets.value = (await chromeAsync.storage.sync.get(STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS))[STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS];

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

})();