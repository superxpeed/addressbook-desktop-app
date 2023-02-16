import React from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {connect} from "react-redux";
import {purple} from "@mui/material/colors";
import {Alert, AlertTitle, Collapse, Drawer, Snackbar} from "@mui/material";
import * as CommonActions from "../Pages/ListActions";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import * as MenuActions from "../Pages/MenuFormActions";
import {bindActionCreators} from "redux";
import Button from "@mui/material/Button";
import {TransitionGroup} from "react-transition-group";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        topButtonColor: {
            main: "#90caf9"
        },
        topServiceButtonColor: {
            main: "#90caf9"
        }
    },
});

const lightTheme = createTheme({
    palette: {
        primary: {
            main: purple[500]
        },
        topButtonColor: {
            main: purple[700]
        },
        topServiceButtonColor: {
            main: "#FFFFFF"
        }
    },
});

export class AppInner extends React.Component {

    state = {
        open: false
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.lastAlert.id != null && this.props.lastAlert.id !== prevProps.lastAlert.id) {
            this.setState({open: true})
        }
    }

    handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        this.setState({open: false})
    };

    prepareAlertMessage = (message) => {
        let targetMessage = message;
        if (targetMessage == null || targetMessage.trim().length === 0) {
            targetMessage = null;
        } else {
            if (targetMessage.length > 300) targetMessage = targetMessage.substring(0, 300)
        }
        return targetMessage
    }

    render() {
        let currentAlerts = []
        this.props.alerts.forEach(alert => {
            currentAlerts.push(
                <Collapse key={alert.id}>
                    <Alert variant="filled"
                           severity={alert.type}
                           sx={{width: "600px", marginLeft: "10px", marginRight: "10px", marginTop: "5px"}}
                           onClose={() => this.props.dismissAlert(alert)}>
                        <AlertTitle>{alert.headline}</AlertTitle>
                        {this.prepareAlertMessage(alert.message)}
                    </Alert>
                </Collapse>
            )
        })
        let lastAlertMessage = null
        if (this.props.lastAlert.id != null) {
            lastAlertMessage = <Alert variant="filled"
                                      severity={this.props.lastAlert.type}
                                      sx={{width: "600px", marginLeft: "10px", marginRight: "10px", marginTop: "5px"}}>
                <AlertTitle>{this.props.lastAlert.headline}</AlertTitle>
                {this.prepareAlertMessage(this.props.lastAlert.message)}
            </Alert>
        }
        return (<ThemeProvider theme={this.props.useDarkTheme ? darkTheme : lightTheme}>
            <CssBaseline>
                {this.props.children}
                <React.Fragment key="drawer_right">
                    <Drawer
                        anchor="right"
                        open={this.props.drawerOpened}
                        onClose={() => this.props.openCloseDrawer(false)}
                    >
                        <Button sx={{
                            width: "600px",
                            marginLeft: "10px",
                            marginRight: "10px",
                            marginTop: "10px",
                            height: "56px",
                            minHeight: "56px"
                        }}
                                onClick={() => this.props.clearAlerts()}
                                startIcon={<DeleteForeverOutlinedIcon/>}
                                variant="contained">
                            Clear all notifications
                        </Button>
                        <TransitionGroup>
                            {currentAlerts}
                        </TransitionGroup>
                    </Drawer>
                </React.Fragment>
                <Snackbar anchorOrigin={{vertical: "top", horizontal: "right"}} open={this.state.open}
                          autoHideDuration={1500} onClose={this.handleClose}>
                    {lastAlertMessage}
                </Snackbar>
            </CssBaseline>
        </ThemeProvider>);
    }
}

export const App = connect((state) => ({
    useDarkTheme: state.listReducer.useDarkTheme,
    drawerOpened: state.listReducer.drawerOpened,
    alerts: state.menuReducer.alerts,
    lastAlert: state.menuReducer.lastAlert
}), (dispatch) => ({
    openCloseDrawer: bindActionCreators(CommonActions.openCloseDrawer, dispatch),
    dismissAlert: bindActionCreators(MenuActions.dismissAlert, dispatch),
    clearAlerts: bindActionCreators(MenuActions.clearAlerts, dispatch)
}), null, {withRef: true})(AppInner);