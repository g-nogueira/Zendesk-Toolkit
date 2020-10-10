"use strict";
(async () => {

    var fileExtension = (await chromeAsync.storage.sync.get(STORAGE_KEYS.FILE_EXTENSIONS))[STORAGE_KEYS.FILE_EXTENSIONS];


    document.body.addEventListener("click", openImage);

    var windowObjectReference = null
    function openWindow(urlObj) {
        var width = 500, height = 500;

        // Commented in order to allow multiple windows
        // if (windowObjectReference == null || windowObjectReference.closed) {
        if (true) {

            let search = new URLSearchParams(urlObj.search);
            let position = getWindowPosition(width, height);

            windowObjectReference = window.open(urlObj.href, search.get("FileName"),
                `height=${position.height},width=${position.width},left=${position.left},top=${position.top}`);

        } else {
            windowObjectReference.focus();
        }
    }

    /**
     *
     * see https://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
     *
     * @param {number} w
     * @param {number} h
     * @returns
     */
    function getWindowPosition(w, h) {
        // Fixes dual-screen position                             Most browsers      Firefox
        // const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        // const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

        const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const systemZoom = width / window.screen.availWidth;
        const left = (width - w) / 2;
        const top = (height - h) / 2;

        return {
            top: top,
            left: left,
            width: w / systemZoom,
            height: h / systemZoom
        };
    }

    function openImage(e) {
        try {

            if (e.target.tagName === "A") {
                let url = new URL(e.target.href);
                let search = new URLSearchParams(url.search);
                let re = new RegExp(`.(${fileExtension.join("|")})$`, "gi");

                if (re.test(search.get("FileName"))) {
                    e.preventDefault();

                    // displayIframe(url);
                    openWindow(url);
                }
            }
            // else if (e.target.tagName === "IMG") {
            //     let url = new URL(e.target.src);
            //     e.preventDefault();
            //     openWindow(url);

            // }
        } catch {
            // TODO: do something
        }
    }

    function openTicket(id) {
        var input = document.querySelector("[data-test-id=header-toolbar-search-input]");

        input.click();
        input.value = id;

    }
})();