/**
 * Simple ajax queries that run against the api.
 *
 * A few history queries still hit routes that don't begin with /api. I have noted them
 * in the comments.
 */

import axios from "axios";
import moment from "moment";
import { prependPath } from "utils/redirect";
import { History } from "./History";

/**
 * Prefix axios with configured path prefix and /api
 */

const api = axios.create({
    baseURL: prependPath("/api"),
});

/**
 * Generic json getter
 * @param {*} response
 */

const doResponse = (response) => {
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
};

/**
 * Some of the current endpoints don't accept JSON, so we need to
 * do some massaging to send in old form post data.
 * @param {Object} fields
 */

function formData(fields = {}) {
    return Object.keys(fields).reduce((result, fieldName) => {
        result.set(fieldName, fields[fieldName]);
        return result;
    }, new FormData());
}

/**
 * Default history request parameters
 */
const stdHistoryParams = {
    view: "summary",
    keys: "size",
};

/**
 * Return list of available histories
 */
export async function getHistoryList() {
    const response = await api.get("/histories", { params: stdHistoryParams });
    const rawList = doResponse(response);
    return rawList.map((props) => new History(props));
}

/**
 * Load one history by id
 * @param {String} id
 */
export async function getHistoryById(id, since) {
    const path = `/histories/${id}`;
    const sinceParam = since !== undefined ? moment.utc(since).toISOString() : null;
    const url = sinceParam ? `${path}?q=update_time-gt&qv=${sinceParam}` : path;
    const response = await api.get(url, { params: stdHistoryParams });
    const props = doResponse(response);
    return new History(props);
}

/**
 * Create new history
 */
export async function createNewHistory() {
    // TODO: adjust api, keep this for later
    // const url = `/histories`;
    // const data = Object.assign({ name: "New History" }, props);
    // const response = await api.post(url, data, { params: stdHistoryParams });

    // using old route to create and select new history at same time
    const url = prependPath("/history/create_new_current");
    const createResponse = await api.get(url, { baseURL: "" });
    const id = createResponse?.data?.id || null;
    if (!id) {
        throw new Error("failed to create and select new history");
    }
    const newHistoryProps = doResponse(createResponse);
    return new History(newHistoryProps);
}

/**
 * Generates copy of history on server
 * @param {Object} history Source history
 * @param {String} name New history name
 * @param {Boolean} copyAll Copy existing contents
 */
export async function cloneHistory(history, name, copyAll) {
    const url = `/histories`;
    const payload = {
        history_id: history.id,
        name,
        all_datasets: copyAll,
        current: true,
    };
    const response = await api.post(url, payload, { params: stdHistoryParams });
    const clonedProps = doResponse(response);
    return new History(clonedProps);
}

/**
 * Delete history on server
 * @param {String} id Encoded history id
 * @param {Boolean} purge Permanent delete
 */
export async function deleteHistoryById(id, purge = false) {
    const url = `/histories/${id}` + (purge ? "?purge=True" : "");
    const response = await api.delete(url, { params: stdHistoryParams });
    return doResponse(response);
}

/**
 * Update specific fields in history
 * @param {Object} history
 * @param {Object} payload fields to update
 */
export async function updateHistoryFields(id, payload) {
    const url = `/histories/${id}`;
    const response = await api.put(url, payload, { params: stdHistoryParams });
    const props = doResponse(response);
    return new History(props);
}

/**
 * Set permissions to private for indicated history
 * TODO: rewrite API endpoint for this
 * @param {String} history_id
 */
export async function secureHistory(history) {
    // NOTE: does not hit normal api/ endpoint
    const { id } = history;
    const url = prependPath("/history/make_private");
    const response = await axios.post(url, formData({ history_id: id }));
    if (response.status != 200) {
        throw new Error(response);
    }
    // instead of a full lookup we could alternately figure out if
    // just a couple fields are changed and return the model with those
    // fields updated. it would avoid an extraneous ajax call
    return await getHistoryById(id);
}

/**
 * Content Current History
 */
export async function getCurrentHistoryFromServer() {
    const url = "/history/current_history_json";
    const response = await api.get(url, {
        baseURL: prependPath("/"), // old api doesn't use api path
    });
    const props = doResponse(response);
    return new History(props);
}

export async function setCurrentHistoryOnServer(history_id) {
    const url = "/history/set_as_current";
    // TODO: why is this a GET?
    // Doesn't matter, it shouldn't exist at all
    const response = await api.get(url, {
        baseURL: prependPath("/"), // old api doesn't use api path
        params: { id: history_id },
    });
    return doResponse(response);
}