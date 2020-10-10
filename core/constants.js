"use strict";

const STORAGE_KEYS = {
    FILEPATH: "filepath",
    URL: "url",
    WATCHING_TICKETS: "watchingTickets",
    NOTIFICATIONS: "notifications",
    FILE_EXTENSIONS: "fileExtensions",
    INTERVAL_RELOAD_WATCHING_TICKETS: "intervalReloadWatchingTickets"
};

const STORAGE_DEFAULTS = {
    [STORAGE_KEYS.FILEPATH]: "Tickets/T<ticket_id>/<file_name>",
    [STORAGE_KEYS.URL]: ".*.zendesk.com\/attachments",
    [STORAGE_KEYS.WATCHING_TICKETS]: [],
    [STORAGE_KEYS.NOTIFICATIONS]: [],
    [STORAGE_KEYS.FILE_EXTENSIONS]: "jpg,png,jpeg,mp4",
    [STORAGE_KEYS.INTERVAL_RELOAD_WATCHING_TICKETS]: "5"
};

const MESSAGE_ACTIONS = {
    WATCH_TICKET: "watchTicket",
    OPEN_TICKET: "openTicket",
    UPDATE_ALL_TICKETS: "updateAllTickets"
};

const ALARMS = {
    RELOAD_ALL_TICKETS: "reloadAllTickets"
};

const MESSAGE_TEMPLATES = {
    // {0} TicketId, {1} Ticket title, {2} Ticket previous status, {3} Ticket current status
    TICKET_STATUS_CHANGED: "#{0} - {2} to {3}  - '{1}' ",
    // {0} TicketId, {1} Ticket title
    WATCHING_TICKET: "#{0} - WATCHING - '{1}'"
};