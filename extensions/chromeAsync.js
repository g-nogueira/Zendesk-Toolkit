"use strict";
const chromeAsync = {

    runtime: {
        sendMessage(message, options) {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(null, message, options, resolve);
            });
        }
    },
    tabs: {
        sendMessage(tabId, message, options) {
            return new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tabId, message, options, resolve);
            });
        },
        getActive() {
            return new Promise((resolve, reject) => {
                chrome.tabs.query({ currentWindow: true, active: true }, resolve)
            });
        }
    },
    storage: {
        sync: {
            set(...args) {
                return new Promise((resolve, reject) => {
                    chrome.storage.sync.set(...args, resolve);
                });
            },
            get(...args) {
                return new Promise((resolve, reject) => {
                    chrome.storage.sync.get(...args, resolve);
                });
            }
        },
        local: {
            set(...args) {
                return new Promise((resolve, reject) => {
                    chrome.storage.local.set(...args, resolve);
                });
            },
            get(...args) {
                return new Promise((resolve, reject) => {
                    chrome.storage.local.get(...args, resolve);
                });
            },
        }
    },
    browserAction: {
        increaseBadgeCount(increase = 1) {
            return new Promise((resolve, reject) => {
                chrome.browserAction.getBadgeText({}, (text) => {

                    var _text = "";

                    if (Number.parseInt(text) !== NaN) {
                        _text = `${+text + increase}`;
                    } else {
                        _text = "1";
                    }

                    chrome.browserAction.setBadgeText({ text: _text }, resolve);
                });
            });
        },
        getTitle(...args) {
            return new Promise((resolve, reject) => {
                chrome.browserAction.getTitle(...args, resolve);
            });
        },
        setTitle(...args) {
            return new Promise((resolve, reject) => {
                chrome.browserAction.setTitle(...args, resolve);
            });
        },
        /**
         *
         *
         * @param {Object} object
         * @param {string} object.title
         * @returns
         */
        increaseTitle(object) {
            return new Promise((resolve, reject) => {
                chrome.browserAction.getTitle({}, (title) => {
                    let newTitle = `${object.title} \r${title}`;

                    chrome.browserAction.setTitle({ title: `${object.title} \r${title}` }, () => resolve(newTitle));
                });
            });
        }
    }
}
