import * as types from "../Common/Utils";
import {Caches, fillCustomFns, OrgTypes} from "../Common/Utils";
import * as tableActions from "../Table/TableActions";

const initialState = {
    tableDataOrganization: {
        data: [],
    },
    fieldDescriptionMapOrganization: {},
    totalDataSizeOrganization: 0,
    tableDataPerson: {
        data: [],
    },
    fieldDescriptionMapPerson: {},
    totalDataSizePerson: 0,
    selectedRowsPerson: [],
    selectedRowsOrganization: [],
    tableDataOrganizationLoading: false,
    tableDataPersonLoading: false,
    sortNameOrganization: "id",
    sortOrderOrganization: "desc",
    paginationOrganization: {pageIndex: 0, pageSize: 10},
    filterObjOrganization: [],
    sortNamePerson: "id",
    sortOrderPerson: "desc",
    paginationPerson: {pageIndex: 0, pageSize: 10},
    filterObjPerson: [],
    customFilterFnsOrganization: {},
    customFilterFnsPerson: {},
    showNotification: false,
    drawerOpened: false,
    useDarkTheme: window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
};

export default function listReducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.GET_LIST + Caches.ORGANIZATION_CACHE + types.SUCCESS:
            if (action.data.data != null) {
                action.data.data.forEach(x => x.type = OrgTypes.getNumType(x.type))
            }
            return Object.assign({}, state, {
                tableDataOrganization: action.data,
                fieldDescriptionMapOrganization: action.fieldDescriptionMap,
                totalDataSizeOrganization: action.data.totalDataSize,
                tableDataOrganizationLoading: false,
                customFilterFnsOrganization: fillCustomFns(action.fieldDescriptionMap, state.customFilterFnsOrganization)
            });
        case types.GET_LIST + Caches.ORGANIZATION_CACHE + types.FAIL:
            return Object.assign({}, state, {
                tableDataOrganizationLoading: false
            });
        case types.GET_LIST + Caches.ORGANIZATION_CACHE + types.REQUEST:
            return Object.assign({}, state, {
                tableDataOrganizationLoading: true
            });
        case tableActions.ON_CUSTOM_FILTER_FUNCTION_CHANGE + Caches.ORGANIZATION_CACHE:
            return Object.assign({}, state, {
                customFilterFnsOrganization: action.customFns
            });
        case tableActions.ON_CUSTOM_FILTER_FUNCTION_CHANGE + Caches.PERSON_CACHE:
            return Object.assign({}, state, {
                customFilterFnsPerson: action.customFns
            });
        case types.GET_LIST + Caches.PERSON_CACHE + types.SUCCESS:
            return Object.assign({}, state, {
                tableDataPerson: action.data,
                fieldDescriptionMapPerson: action.fieldDescriptionMap,
                totalDataSizePerson: action.data.totalDataSize,
                tableDataPersonLoading: false,
                customFilterFnsPerson: fillCustomFns(action.fieldDescriptionMap, state.customFilterFnsPerson)
            });
        case types.GET_LIST + Caches.PERSON_CACHE + types.FAIL:
            return Object.assign({}, state, {
                tableDataPersonLoading: false
            });
        case types.SHOW_NOTIFICATION_CHANGE:
            return Object.assign({}, state, {
                showNotification: action.showNotification
            });
        case types.USE_DARK_THEME:
            return Object.assign({}, state, {
                useDarkTheme: action.useDarkTheme
            });
        case types.OPEN_CLOSE_DRAWER:
            return Object.assign({}, state, {
                drawerOpened: action.isOpened
            });
        case types.GET_LIST + Caches.PERSON_CACHE + types.REQUEST:
            return Object.assign({}, state, {
                tableDataPersonLoading: true
            });
        case tableActions.ON_SELECT_ROW + Caches.ORGANIZATION_CACHE:
            return Object.assign({}, state, {
                selectedRowsOrganization: state.tableDataOrganization.data.filter(item => Object.keys(action.row).includes(item.id))
            });
        case tableActions.ON_SELECT_ROW + Caches.PERSON_CACHE:
            return Object.assign({}, state, {
                selectedRowsPerson: state.tableDataPerson.data.filter(item => Object.keys(action.row).includes(item.id))
            });
        case tableActions.SYNC_SELECTED_ROWS + Caches.PERSON_CACHE:
            return Object.assign({}, state, {
                selectedRowsPerson: state.selectedRowsPerson.filter(item => Object.keys(action.row).includes(item.id))
            });
        case tableActions.UPDATE_ROW_IN_TABLE + Caches.PERSON_CACHE: {
            let newSelected = state.selectedRowsPerson.filter((it) => it.id !== action.row.id);
            newSelected.push(action.row);
            return Object.assign({}, state, {selectedRowsPerson: newSelected});
        }
        case tableActions.ON_PAGINATION_CHANGE + Caches.PERSON_CACHE: {
            return Object.assign({}, state, {paginationPerson: action.pagination});
        }
        case tableActions.ON_PAGINATION_CHANGE + Caches.ORGANIZATION_CACHE: {
            return Object.assign({}, state, {paginationOrganization: action.pagination});
        }
        case tableActions.ON_FILTER_CHANGE + Caches.PERSON_CACHE: {
            return Object.assign({}, state, {filterObjPerson: action.filter});
        }
        case tableActions.ON_FILTER_CHANGE + Caches.ORGANIZATION_CACHE: {
            return Object.assign({}, state, {filterObjOrganization: action.filter});
        }
        case tableActions.ON_SORTING_CHANGE + Caches.PERSON_CACHE: {
            return Object.assign({}, state, {sortNamePerson: action.sortName, sortOrderPerson: action.sortOrder});
        }
        case tableActions.ON_SORTING_CHANGE + Caches.ORGANIZATION_CACHE: {
            return Object.assign({}, state, {
                sortNameOrganization: action.sortName,
                sortOrderOrganization: action.sortOrder
            });
        }
        case tableActions.UPDATE_ROW_IN_TABLE + Caches.ORGANIZATION_CACHE: {
            let org = Object.assign({}, action.row);
            org["type"] = OrgTypes.getNumType(action.row["type"]);
            return Object.assign({}, state, {selectedRowsOrganization: [org]});
        }
        default:
            return state;
    }
}
