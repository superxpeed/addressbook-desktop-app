export const ON_SELECT_ROW = "ON_SELECT_ROW";
export const SYNC_SELECTED_ROWS = "SYNC_SELECTED_ROWS";
export const ON_PAGINATION_CHANGE = "ON_PAGINATION_CHANGE";
export const ON_SORTING_CHANGE = "ON_SORTING_CHANGE";
export const ON_FILTER_CHANGE = "ON_FILTER_CHANGE";
export const ON_CUSTOM_FILTER_FUNCTION_CHANGE = "ON_CUSTOM_FILTER_FUNCTION_CHANGE";
export const UPDATE_ROW_IN_TABLE = "UPDATE_ROW_IN_TABLE";

export function onSelectRow(row, cacheName) {
    return (dispatch) => {
        dispatch({
            type: ON_SELECT_ROW + cacheName, row: row
        });
    };
}

export function syncSelectedRows(row, cacheName) {
    return (dispatch) => {
        dispatch({
            type: SYNC_SELECTED_ROWS + cacheName, row: row
        });
    };
}

export function onPaginationChange(pagination, cacheName) {
    return (dispatch) => {
        dispatch({
            type: ON_PAGINATION_CHANGE + cacheName, pagination: pagination,
        });
    };
}

export function onFilterChange(filter, cacheName) {
    return (dispatch) => {
        dispatch({
            type: ON_FILTER_CHANGE + cacheName, filter: filter,
        });
    };
}

export function onCustomFilterFn(customFns, cacheName) {
    return (dispatch) => {
        dispatch({
            type: ON_CUSTOM_FILTER_FUNCTION_CHANGE + cacheName, customFns: customFns
        });
    };
}

export function onSortingChange(sortName, sortOrder, cacheName) {
    return (dispatch) => {
        dispatch({
            type: ON_SORTING_CHANGE + cacheName, sortName: sortName, sortOrder: sortOrder
        });
    };
}

export function updateRow(row, cacheName) {
    return (dispatch) => {
        dispatch({
            type: UPDATE_ROW_IN_TABLE + cacheName, row: row,
        });
    };
}