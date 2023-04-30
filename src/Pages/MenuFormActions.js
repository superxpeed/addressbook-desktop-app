import Cookies from "js-cookie";
import {
    ADD_ALERT,
    AuthTokenUtils,
    CLEAR_ALERTS,
    DISMISS_ALERT,
    GET_BREADCRUMBS,
    GET_MENU,
    SUCCESS,
} from "../Common/Utils";
import {asyncCommonCatch, ifNoAuthorizedRedirect} from "./ListActions";
import * as url from "../Common/Url";

export function getNextLevelMenus(serverUrl, currentUrl) {
    let isOk = false;
    return function (dispatch) {
        const headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json; charset=utf-8");
        fetch(`${serverUrl}${url.GET_NEXT_LEVEL_MENUS}?currentUrl=${currentUrl}`, {
            method: "get", headers,
        })
            .then((response) => {
                ifNoAuthorizedRedirect(response);
                isOk = response.ok;
                return response.text();
            })
            .then((text) => {
                if (isOk) {
                    dispatch({
                        type: GET_MENU + SUCCESS, data: JSON.parse(text).data,
                    });
                } else {
                    dispatch({
                        type: ADD_ALERT, alert: JSON.parse(text),
                    });
                }
            })
            .catch((error) => {
                asyncCommonCatch(GET_MENU, error, dispatch);
            });
    };
}

export function showCommonErrorAlert(text) {
    return (dispatch) => {
        dispatch({
            type: ADD_ALERT, alert: JSON.parse(text),
        });
    };
}

export function showAxiosErrorAlert(text) {
    return (dispatch) => {
        dispatch({
            type: ADD_ALERT, alert: text,
        });
    };
}

export function showCommonAlert(message) {
    return (dispatch) => {
        dispatch({
            type: ADD_ALERT, alert: {type: "success", message: message, headline: "Success"},
        });
    };
}

export function showCommonTextErrorAlert(message) {
    return (dispatch) => {
        dispatch({
            type: ADD_ALERT, alert: {type: "error", message: message, headline: "Error"},
        });
    };
}

export function getBreadcrumbs(serverUrl, currentUrl) {
    let isOk = false;
    return function (dispatch) {
        const headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json; charset=utf-8");
        fetch(`${serverUrl}${url.GET_BREADCRUMBS}?currentUrl=${currentUrl}`, {
            method: "get", headers,
        })
            .then((response) => {
                ifNoAuthorizedRedirect(response);
                isOk = response.ok;
                return response.text();
            })
            .then((text) => {
                if (isOk) {
                    dispatch({
                        type: GET_BREADCRUMBS + SUCCESS, data: JSON.parse(text).data,
                    });
                } else {
                    dispatch({
                        type: ADD_ALERT, alert: JSON.parse(text),
                    });
                }
            })
            .catch((error) => {
                asyncCommonCatch(GET_BREADCRUMBS, error, dispatch);
            });
    };
}

export function lockUnlockRecord(serverUrl, type, id, action, showNotification, callback) {
    let targetUrl = "";
    let isOk = false;
    if (action === "lock") {
        targetUrl = url.LOCK_RECORD;
    } else if (action === "unlock") {
        targetUrl = url.UNLOCK_RECORD;
    }
    return function (dispatch) {
        const headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        fetch(`${serverUrl}${targetUrl}?type=${type}&id=${id}`, {
            method: "get", headers,
        })
            .then((response) => {
                ifNoAuthorizedRedirect(response);
                isOk = response.ok;
                return response.text();
            })
            .then((text) => {
                if (isOk) {
                    if (showNotification) {
                        dispatch({
                            type: ADD_ALERT, alert: JSON.parse(text).data,
                        });
                    }
                    if (callback) callback(JSON.parse(text).data.type);
                } else {
                    dispatch({
                        type: ADD_ALERT, alert: JSON.parse(text),
                    });
                }
            })
            .catch((error) => {
                asyncCommonCatch(GET_BREADCRUMBS, error, dispatch);
            });
    };
}

export function logout(serverUrl) {
    let isOk = false;
    return function () {
        const headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        fetch(serverUrl + url.LOGOUT, {
            method: "get", headers,
        }).then((response) => {
            isOk = response.ok;
            if (isOk) {
                window.sessionStorage.clear();
                Cookies.remove("Authorization");
                window.location.hash = "#/login";
            }
        });
    };
}

export function dismissAlert(alert) {
    return (dispatch) => {
        dispatch({
            type: DISMISS_ALERT, alert,
        });
    };
}

export function clearAlerts() {
    return (dispatch) => {
        dispatch({
            type: CLEAR_ALERTS,
        });
    };
}
