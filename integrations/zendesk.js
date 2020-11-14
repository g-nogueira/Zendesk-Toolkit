/*

- /api/lotus/tickets/2377857/conversations.json?include=brands,permissions,users,groups,organizations,sharing_agreements,incident_counts&sort_order=desc
- /api/v2/users/371645624698.json
- /api/v2/users/me?include=abilities,roles,groups
/api/v2/account/settings.json
/api/v2/account.json?include=subscription,deployments,hc_settings,branding,secondary_subscriptions
/api/v2/users/me/settings.json
- /api/v2/ticket_fields/34790449.json
- /api/v2/ticket_fields?creator=true&include=users
/api/v2beta/tickets/2377857/related
- /api/v2/tickets/2377857.json
/api/v2/tickets/2377857/audits.json?include=users

/api/v2/search/incremental?per_page=30&include=highlights&page=1&type=ticket&query=test
/api/v2/tickets/show_many.json?ids={ids}

*/

const zendesk = {
    api: {

        async isAuthenticated() {
            // TODO: Implemented a verification method
        },
        async tickets(ticketId) {
            var url = `https://supportoutsystems.zendesk.com/api/v2/tickets/${ticketId}.json`;
            var resolvedPromise = await _fetch(url);

            if (resolvedPromise.ok) {
                var finalResponse = await resolvedPromise.json();
                return finalResponse;
            }
            else {
                return false;
            }
        },
        async ticketsShowMany(ticketIds = []) {
            var url = `https://supportoutsystems.zendesk.com/api/v2/tickets/show_many.json?ids=${ticketIds.join(",")}`;
            var resolvedPromise = await _fetch(url);

            if (resolvedPromise.ok) {
                var finalResponse = await resolvedPromise.json();
                return finalResponse;
            }
            else {
                return false;
            }
        },
        async users(userId) {
            var url = `https://supportoutsystems.zendesk.com/api/v2/users/${userId}.json`;
            var resolvedPromise = await _fetch(url);;

            if (resolvedPromise.ok) {
                var finalResponse = await resolvedPromise.json();
                return finalResponse;
            }
            else {
                return false;
            }
        },
        async usersMe() {
            var url = `https://supportoutsystems.zendesk.com/api/v2/users/me`;
            var resolvedPromise = await _fetch(url);

            if (resolvedPromise.ok) {
                var finalResponse = await resolvedPromise.json();
                return finalResponse;
            }
            else {
                return false;
            }
        },
        async ticketsComments(ticketId, commentId) {

            var url = `https://supportoutsystems.zendesk.com/api/v2/tickets/${ticketId}/comments.json?include=users`;
            var resolvedPromise = await _fetch(url);

            if (resolvedPromise.ok) {

                var finalResponse = await resolvedPromise.json();
                if (commentId) {
                    finalResponse.comments = finalResponse.comments.filter((comment) => +comment.id === +commentId);
                }
                return finalResponse;
            }
            else {
                return false;
            }
        }

    }
};

const _fetch = async (url) => {
    var resolvedPromise = await fetch(url);

    if (resolvedPromise.ok) {
        return resolvedPromise;
    }
    else {
        // var message = "Zendesk API fetch failed with status " + resolvedPromise.status + " " + resolvedPromise.statusText;
        // notificationHelper.log({ message });

        return false;
    }
}