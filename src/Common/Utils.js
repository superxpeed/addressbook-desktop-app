import Cookies from "js-cookie";
import {Link} from "@mui/material";
import React from "react";

export const REQUEST = "_REQUEST";
export const SUCCESS = "_SUCCESS";
export const FAIL = "_FAIL";
export const GET_LIST = "GET_LIST";
export const GET_MENU = "GET_MENU";
export const GET_BREADCRUMBS = "GET_BREADCRUMBS";
export const SHOW_NOTIFICATION_CHANGE = "SHOW_NOTIFICATION_CHANGE";
export const USE_DARK_THEME = "USE_DARK_THEME";
export const OPEN_CLOSE_DRAWER = "OPEN_CLOSE_DRAWER";
export const ADD_ALERT = "ADD_ALERT";
export const DISMISS_ALERT = "DISMISS_ALERT";
export const CLEAR_ALERTS = "CLEAR_ALERTS";

export var Caches = {
    ORGANIZATION_CACHE: "com.addressbook.model.Organization", PERSON_CACHE: "com.addressbook.model.Person",
};

export const currencies = ["AED", "ALL", "ARS", "AUD", "BAM", "BGN", "BHD", "BOB", "BRL", "BYN", "CAD", "CHF", "CLP",
    "CNY", "COP", "CRC", "CSD", "CUP", "CZK", "DKK", "DOP", "DZD", "EGP", "EUR", "GBP", "GTQ", "HKD", "HNL", "HRK",
    "HUF", "IDR", "ILS", "INR", "IQD", "ISK", "JOD", "JPY", "KRW", "KWD", "LBP", "LYD", "MAD", "MKD", "MXN", "MYR",
    "NIO", "NOK", "NZD", "OMR", "PAB", "PEN", "PHP", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "SAR", "SDG", "SEK",
    "SGD", "SVC", "SYP", "THB", "TND", "TRY", "TWD", "UAH", "USD", "UYU", "VES", "VND", "YER", "ZAR"];

export class OrgTypes {
    static getEngType = (type) => {
        if (type === "Non profit") return "0";
        if (type === "Private") return "1";
        if (type === "Government") return "2";
        if (type === "Public") return "3";
    };

    static getNumType = (type) => {
        if (type === "0") return "Non profit";
        if (type === "1") return "Private";
        if (type === "2") return "Government";
        if (type === "3") return "Public";
    };
}

export class ContactTypes {
    static getEngType = (type) => {
        if (type === "0") return "Mobile phone";
        if (type === "1") return "Home phone";
        if (type === "2") return "Address";
        if (type === "3") return "E-mail";
    };
}

export class DateComparators {
    static getEngType = (type) => {
        if (type === "equals" || type === "material_react_table_esm_equals") return "Equals";
        if (type === "notEquals") return "Not Equals";
        if (type === "greaterThan") return "Greater Than";
        if (type === "greaterThanOrEqualTo") return "Greater Than Or Equal To";
        if (type === "lessThan") return "Less Than";
        if (type === "lessThanOrEqualTo") return "Less Than Or Equal To";
    };

    static getMathComparator = (type) => {
        if (type === "equals" || type === "material_react_table_esm_equals") return "=";
        if (type === "notEquals") return "!=";
        if (type === "greaterThan") return ">";
        if (type === "greaterThanOrEqualTo") return ">=";
        if (type === "lessThan") return "<";
        if (type === "lessThanOrEqualTo") return "<=";
    };
}

export class HashUtils {
    static cleanHash = (hash) => {
        if (hash === "/root") return hash;
        if (hash.startsWith("#")) return hash.substring(1);
    };
}

export class AuthTokenUtils {
    static addAuthToken = (headers) => {
        const auth = Cookies.get("Authorization");
        if (auth != null && auth !== window.sessionStorage.getItem("auth-token")) {
            window.sessionStorage.clear();
            window.sessionStorage.setItem("auth-token", auth);
        }
        headers.append("Authorization", `Bearer ${window.sessionStorage.getItem("auth-token")}`);
    };
}

export class Generator {
    static uuidv4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

export function fillCustomFns(fieldDescriptionMap, oldCustomFns) {
    let newCustomFns = Object.assign({}, oldCustomFns)
    if ((fieldDescriptionMap != null && Object.keys(fieldDescriptionMap).length !== 0) || fieldDescriptionMap.constructor !== Object) {
        Object.keys(fieldDescriptionMap).forEach(key => {
            let element = fieldDescriptionMap[key]
            if (newCustomFns[element.name] == null) {
                if (element.name === "type") {
                    newCustomFns[element.name] = "equals"
                } else if (element.type === "java.lang.String") {
                    newCustomFns[element.name] = "contains"
                } else if (element.type === "java.util.Date") {
                    newCustomFns[element.name] = "equals"
                }
            }
        })
    }
    return newCustomFns;
}

export function convertFilterObj(filterObj, customFilterFns) {
    let converted = [];
    for (const filter of filterObj) {
        if (filter.id === "lastUpdated") {
            converted.push({
                name: filter.id,
                value: filter.value.toDate().toISOString().substring(0, 10),
                comparator: customFilterFns["lastUpdated"] == null ? "=" : DateComparators.getMathComparator(customFilterFns["lastUpdated"]),
                type: "DateFilter",
            });
        } else {
            converted.push({name: filter.id, value: filter.value, comparator: "", type: "TextFilter"});
        }
    }
    return converted;
}

export function getPhoneRegEx() {
    return new RegExp(/^[+]?[\s./0-9]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/g)
}

export function getBreadcrumbsList(breadcrumbs, useDarkTheme) {
    const breads = [];
    const breadcrumbsCount = breadcrumbs.length;
    breadcrumbs.forEach((element, index) => {
        if (index === breadcrumbsCount - 1) {
            breads.push(<Link
                underline="hover"
                color={useDarkTheme ? "text.primary" : "white"}
                aria-current="page"
                key={element.url}
                href={`#${element.url}`}
            >
                {" "}
                {element.name}
                {" "}
            </Link>);
        } else {
            breads.push(<Link
                underline="hover"
                color={useDarkTheme ? "inherit" : "white"}
                key={element.url}
                href={`#${element.url}`}
            >
                {" "}
                {element.name}
                {" "}
            </Link>);
        }
    });
    return breads;
}
