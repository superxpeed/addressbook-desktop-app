import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import {
    AppBar,
    Badge,
    Breadcrumbs,
    Checkbox,
    Chip,
    Container,
    DialogActions,
    DialogContentText,
    FormControlLabel,
    FormGroup,
    IconButton,
    Toolbar,
    Tooltip
} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as url from "../Common/Url";
import * as CommonActions from "../Pages/ListActions";
import * as MenuActions from "../Pages/MenuFormActions";
import {AuthTokenUtils} from "../Common/Utils";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonIcon from "@mui/icons-material/Person";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import LogoutIcon from "@mui/icons-material/Logout";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export class NavBarComponentInner extends React.Component {
    state = {
        username: "",
        roles: [],
        showUserInfo: false,
        showSettings: false,
        showLogoutConfirmation: false,
        buildVersion: "",
        buildTime: "",
    };

    updatePersonInfo = () => {
        let isOk = false;
        const headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json; charset=utf-8");
        fetch(this.props.serverUrl + url.GET_USER_INFO, {
            method: "get", headers,
        })
            .then((response) => {
                CommonActions.ifNoAuthorizedRedirect(response);
                isOk = response.ok;
                return response.text();
            })
            .then((text) => {
                if (isOk) {
                    const currentUser = JSON.parse(text);
                    this.setState({
                        username: currentUser.login, roles: currentUser.roles,
                    });
                } else {
                    this.props.showCommonErrorAlert(text);
                }
            });
    };

    updateBuildInfo = () => {
        let isOk = false;
        const headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json; charset=utf-8");
        fetch(this.props.serverUrl + url.GET_BUILD_INFO, {
            method: "get", headers,
        })
            .then((response) => {
                CommonActions.ifNoAuthorizedRedirect(response);
                isOk = response.ok;
                return response.text();
            })
            .then((text) => {
                if (isOk) {
                    const buildInfo = JSON.parse(text);
                    this.setState({
                        buildVersion: buildInfo.version, buildTime: buildInfo.time,
                    });
                } else {
                    this.props.showCommonErrorAlert(text);
                }
            });
    };

    componentDidMount() {
        this.updatePersonInfo();
        this.updateBuildInfo();
    }

    getRoles = () => {
        const allRoles = [];
        let targetBoxColor = this.props.useDarkTheme ? "#90caf9" : "#9c27b0"
        let targetTextColor = this.props.useDarkTheme ? "#000000" : "#FFFFFF"
        this.state.roles.forEach((value, index) => {
            if (index === 0)
                allRoles.push(<Chip key={value} label={value}
                                    sx={{backgroundColor: targetBoxColor, color: targetTextColor}}
                                    color="info" variant="contained"/>);
            else
                allRoles.push(<Chip key={value} label={value}
                                    sx={{ml: 1, backgroundColor: targetBoxColor, color: targetTextColor}}
                                    color="info" variant="contained"/>);
        });
        return allRoles;
    };

    render() {
        let separator;
        if (this.props.useDarkTheme) {
            separator = <NavigateNextIcon fontSize="small"/>
        } else {
            separator = <NavigateNextIcon fontSize="small" style={{color: "white"}}/>
        }
        return (
            <div>
                <AppBar position="static">
                    <Container maxWidth="xl">
                        <Toolbar disableGutters>
                            <Breadcrumbs separator={separator} style={{flex: 1}}
                                         aria-label="breadcrumb">{this.props.breads}</Breadcrumbs>
                            {this.props.children}
                            <Button
                                startIcon={<PersonIcon/>}
                                variant="contained"
                                edge="end"
                                color={this.props.useDarkTheme ? "primary" : "topButtonColor"}
                                onClick={() => this.setState({showUserInfo: true})}
                            >
                                {this.state.username}
                            </Button>
                            <Tooltip title="Notifications">
                                <IconButton onClick={() => this.props.openCloseDrawer(true)}
                                            color={this.props.useDarkTheme ? "primary" : "topServiceButtonColor"}>
                                    <Badge max={99}
                                           badgeContent={this.props.alerts.length}
                                           color={this.props.useDarkTheme ? "primary" : "topButtonColor"}>
                                        <NotificationsActiveOutlinedIcon/>
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Settings">
                                <IconButton onClick={() => this.setState({showSettings: true})}
                                            color={this.props.useDarkTheme ? "primary" : "topServiceButtonColor"}>
                                    <SettingsOutlinedIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Log out">
                                <IconButton color={this.props.useDarkTheme ? "primary" : "topServiceButtonColor"}
                                            onClick={() => this.setState({showLogoutConfirmation: true})}>
                                    <LogoutIcon/>
                                </IconButton>
                            </Tooltip>
                        </Toolbar>
                    </Container>
                </AppBar>
                <Dialog
                    onClose={() => this.setState({showUserInfo: false})}
                    aria-labelledby="roles-dialog-title"
                    open={this.state.showUserInfo}
                >
                    <DialogTitle id="roles-dialog-title" onClose={() => this.setState({showUserInfo: false})}>
                        Roles for
                        {" "}
                        {this.state.username}
                    </DialogTitle>
                    <DialogContent dividers>
                        {this.getRoles()}
                    </DialogContent>
                    <DialogContent dividers>
                        <Chip
                            edge="end"
                            size="small"
                            key="build_version"
                            label={`Build version: ${this.state.buildVersion}`}
                            variant="outlined"
                        />
                        <Chip
                            edge="end"
                            size="small"
                            key="build_time"
                            label={`Build time: ${this.state.buildTime}`}
                            variant="outlined"
                            sx={{ml: 1}}
                        />
                    </DialogContent>
                </Dialog>
                <Dialog
                    onClose={() => this.setState({showSettings: false})}
                    aria-labelledby="roles-dialog-title"
                    open={this.state.showSettings}
                >
                    <DialogTitle id="roles-dialog-title" onClose={() => this.setState({showSettings: false})}>
                        Settings
                    </DialogTitle>
                    <DialogContent dividers>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox
                                icon={<NotificationsActiveOutlinedIcon/>}
                                checkedIcon={<NotificationsActiveIcon/>}
                                checked={this.props.showNotification}
                                onChange={(e, v) => {
                                    this.props.changeShowNotification(v)
                                }}
                                inputProps={{"aria-label": "controlled"}}/>}
                                              label="Show lock notifications"/>
                        </FormGroup>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox
                                icon={<DarkModeOutlinedIcon/>}
                                checkedIcon={<DarkModeIcon/>}
                                checked={this.props.useDarkTheme}
                                onChange={(e, v) => {
                                    this.props.changeUseDarkTheme(v)
                                }}
                                inputProps={{"aria-label": "controlled"}}/>}
                                              label="Use dark theme"/>
                        </FormGroup>
                    </DialogContent>
                </Dialog>
                <Dialog
                    open={this.state.showLogoutConfirmation}
                    onClose={() => this.setState({showLogoutConfirmation: false})}
                    aria-describedby="confirmation-modal-description"
                >
                    <DialogTitle>Confirm log out</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="confirmation-modal-description">
                            Do you want to log out?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({showLogoutConfirmation: false})}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={() => this.props.logout(this.props.serverUrl)}>Log out</Button>
                    </DialogActions>
                </Dialog>
            </div>);
    }
}

export const NavBarComponent = connect((state) => ({
    showNotification: state.listReducer.showNotification,
    serverUrl: state.listReducer.serverUrl,
    useDarkTheme: state.listReducer.useDarkTheme,
    alerts: state.menuReducer.alerts
}), (dispatch) => ({
    showCommonErrorAlert: bindActionCreators(MenuActions.showCommonErrorAlert, dispatch),
    changeShowNotification: bindActionCreators(CommonActions.changeShowNotification, dispatch),
    openCloseDrawer: bindActionCreators(CommonActions.openCloseDrawer, dispatch),
    changeUseDarkTheme: bindActionCreators(CommonActions.changeUseDarkTheme, dispatch),
    logout: bindActionCreators(MenuActions.logout, dispatch)
}), null, {withRef: true})(NavBarComponentInner);