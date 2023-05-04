import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from "@mui/material/Button";
import * as MenuActions from "./MenuFormActions";
import * as Utils from "../Common/Utils";
import {AuthTokenUtils, HashUtils} from "../Common/Utils";
import {NavBarComponent} from "../Components/NavBarComponent";
import * as url from "../Common/Url";
import {ifNoAuthorizedRedirect} from "./ListActions";

export class MenuFormInner extends React.Component {
    state = {
        currentUrl: undefined,
    };

    updateAll = () => {
        let currentUrl = window.location.hash;
        if (currentUrl === "#/") currentUrl = "/root";
        currentUrl = HashUtils.cleanHash(currentUrl);
        if (this.state.currentUrl !== currentUrl) {
            const headers = new Headers();
            AuthTokenUtils.addAuthToken(headers);
            fetch(this.props.serverUrl + url.CHECK_IF_PAGE_EXISTS + `?page=${currentUrl}`, {
                method: "get", headers,
            }).then((response) => {
                ifNoAuthorizedRedirect(response);
                return response.text();
            }).then((text) => {
                if (text === "true") {
                    this.setState({currentUrl});
                    this.props.getBreadcrumbs(this.props.serverUrl, currentUrl);
                    this.props.getNextLevelMenus(this.props.serverUrl, currentUrl);
                } else if (text === "false") {
                    window.history.pushState("", "/", "404.html");
                    window.location.pathname = "404.html";
                }
            });
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.updateAll();
    }

    componentDidMount() {
        this.updateAll();
    }

    render() {
        const allMenus = [];
        this.props.menus.forEach((element) => {
            allMenus.push(<Button
                variant="contained"
                key={`btn_${element.url}`}
                sx={{boxShadow: 10}}
                style={{
                    height: "200px",
                    width: "200px",
                    margin: "8px",
                    textAlign: "center",
                    fontSize: "x-large",
                }}
                href={`#${element.url}`}
            >
                {" "}
                {element.name}
                {" "}
            </Button>);
        });
        const breads = Utils.getBreadcrumbsList(this.props.breadcrumbs, this.props.useDarkTheme)
        return (<div>
            <NavBarComponent breads={breads}/>
            {allMenus}
        </div>);
    }
}

export const MenuForm = connect((state) => ({
    breadcrumbs: state.menuReducer.breadcrumbs,
    menus: state.menuReducer.menus,
    serverUrl: state.listReducer.serverUrl,
    useDarkTheme: state.listReducer.useDarkTheme
}), (dispatch) => ({
    getBreadcrumbs: bindActionCreators(MenuActions.getBreadcrumbs, dispatch),
    getNextLevelMenus: bindActionCreators(MenuActions.getNextLevelMenus, dispatch)
}), null, {withRef: true})(MenuFormInner);