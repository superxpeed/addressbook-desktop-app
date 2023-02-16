import * as types from "../Common/Utils";
import {ADD_ALERT, CLEAR_ALERTS, DISMISS_ALERT} from "../Common/Utils";

const initialState = {
    breadcrumbs: [],
    menus: [],
    alerts: [],
    lastAlert: {}
};

export default function menuReducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.GET_MENU + types.SUCCESS:
            return {...state, menus: action.data};
        case types.GET_BREADCRUMBS + types.SUCCESS:
            return {...state, breadcrumbs: action.data};
        case ADD_ALERT: {
            const newAlert = {
                id: new Date().getTime(),
                type: action.alert.type,
                headline: action.alert.headline,
                message: action.alert.message,
            };
            if (state.alerts != null && state.alerts.length > 200)
                state.alerts.pop()
            if (newAlert.headline.trim().toLowerCase().includes("record"))
                return {...state, alerts: [newAlert, ...state.alerts]};
            else
                return {...state, alerts: [newAlert, ...state.alerts], lastAlert: newAlert};
        }
        case DISMISS_ALERT: {
            return {...state, alerts: state.alerts.filter((it) => it.id !== action.alert.id)};
        }
        case CLEAR_ALERTS: {
            return {...state, alerts: []};
        }
        default:
            return state;
    }
}
