import React from "react";
import {
    Alert,
    Box,
    Dialog,
    DialogActions,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    TextField,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Cookies from "js-cookie";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import * as MenuActions from "./MenuFormActions";
import * as url from "../Common/Url";
import LoginIcon from "@mui/icons-material/Login";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SaveIcon from "@mui/icons-material/Save";
import * as CommonActions from "./ListActions";
const { ipcRenderer } = window;

export class LoginFormInner extends React.Component {
    state = {
        login: "",
        password: "",
        invalidLoginPassword: false,
        showPassword: false,
        showSettings: false,
        serverUrl: null,
        serverError: null
    };

    keyDownTextField = (e) => {
        const parent = this;
        const {keyCode} = e;
        if (keyCode === 13) {
            parent.login();
        }
    };

    componentDidMount() {
        setTimeout(() => {
            this.props.clearAlerts();
        }, 500);
        document.addEventListener("keydown", this.keyDownTextField, false);
        ipcRenderer.send('get-server-url');
        ipcRenderer.receive('server-url', (arg) => {
            this.updateServerUrl(arg)
        });
    }

    updateServerUrl = (serverUrl) => {
        this.setState({serverUrl: serverUrl});
        this.props.changeServerUrl(serverUrl);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyDownTextField, false);
    }

    handleChange = (e) => {
        this.setState({[e.target.id]: e.target.value});
    };

    login = () => {
        let status;
        const headers = new Headers();
        const credentials = {
            login: this.state.login, password: this.state.password,
        };
        headers.append("Content-Type", "application/json; charset=utf-8");
        fetch(this.props.serverUrl + url.AUTH, {
            method: "post", headers, body: JSON.stringify(credentials),
        }).then((response) => {
            status = response.status;
            return response.text();
        }).then((text) => {
            if (status === 401) {
                this.setState({invalidLoginPassword: true});
            }
            if (status === 404) {
                this.setState({serverError: "Invalid server URL!", invalidLoginPassword: false});
            }
            if (status === 200) {
                Cookies.remove("Authorization");
                window.sessionStorage.clear();
                window.sessionStorage.setItem("auth-token", JSON.parse(text).token);
                window.location.hash = "#/";
            }
        }).catch((error) => {
            this.setState({serverError: error.message, invalidLoginPassword: false});
        });
    };

    getWarning = () => {
        if (this.state.invalidLoginPassword) {
            return (<Alert severity="error" sx={{mb: 1}}>
                Invalid login or password
            </Alert>);
        }
        return <div/>;
    };

    getServerUrlWarning = () => {
        if (this.props.serverUrl == null || this.props.serverUrl.trim().length === 0) {
            return (<Alert severity="error" sx={{mb: 1}}>
                Server URL is empty!
            </Alert>);
        }
        return <div/>;
    };

    getServerError = () => {
        if (this.state.serverError != null && this.state.serverError.trim().length !== 0) {
            return (<Alert severity="error" sx={{mb: 1}}>
                {this.state.serverError}
            </Alert>);
        }
        return <div/>;
    };

    render() {
        return (<div>
            <Dialog fullWidth maxWidth="sm" open={true}>
                <DialogTitle>
                    <div style={{display: "inline-block", width: "512px"}}>
                        Please login
                    </div>
                    <IconButton onClick={() => this.setState({showSettings: true})}>
                        <SettingsOutlinedIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{paddingBottom: "16px"}}>
                    <Box sx={{display: "grid", gridTemplateRows: "repeat(2 1fr)"}}>
                        {this.getWarning()}
                        {this.getServerUrlWarning()}
                        {this.getServerError()}
                        <TextField
                            id="login"
                            type="text"
                            label="Enter login"
                            variant="outlined"
                            autoComplete="off"
                            sx={{mt: 1}}
                            onChange={this.handleChange}
                        />
                        <FormControl sx={{mt: 2}} variant="outlined">
                            <InputLabel htmlFor="password">Enter password</InputLabel>
                            <OutlinedInput
                                id="password"
                                label="Enter password"
                                type={this.state.showPassword ? "text" : "password"}
                                autoComplete="off"
                                onChange={this.handleChange}
                                endAdornment={<InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => this.setState({showPassword: !this.state.showPassword})}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                        }}
                                    >
                                        {this.state.showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>}
                            />
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{paddingTop: "0px"}}>
                    <Grid container sx={{justifyContent: "center"}}>
                        <Button startIcon={<LoginIcon/>}
                                sx={{ml: 2, mr: 2, mb: 2, width: "100%", height: "56px"}}
                                variant="contained"
                                onClick={this.login}>Login</Button>
                    </Grid>
                </DialogActions>
            </Dialog>
            <Dialog fullWidth maxWidth="xs"
                    onClose={() => this.setState({showSettings: false})}
                    aria-labelledby="roles-dialog-title"
                    open={this.state.showSettings}>
                <DialogTitle id="roles-dialog-title" onClose={() => this.setState({showSettings: false})}>
                    Settings
                </DialogTitle>
                <DialogContent dividers>
                    <TextField
                        error={this.state.serverUrl == null || this.state.serverUrl.trim().length === 0}
                        id="serverUrl"
                        type="text"
                        label="Enter server URL"
                        value={this.state.serverUrl}
                        variant="outlined"
                        autoComplete="off"
                        sx={{mt: 1, display: "flex", height: "80px"}}
                        helperText={this.state.serverUrl == null || this.state.serverUrl.trim().length === 0 ? "Required option!" : ""}
                        onChange={(e) => {
                            this.setState({serverUrl: e.target.value});
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{paddingTop: "0px"}}>
                    <Grid container sx={{justifyContent: "center"}}>
                        <Button startIcon={<SaveIcon/>} sx={{ml: 2, mr: 2, mb: 2, width: "100%", height: "56px"}}
                                disabled={this.state.serverUrl == null || this.state.serverUrl.trim().length === 0}
                                variant="contained"
                                onClick={() => {
                                    this.props.changeServerUrl(this.state.serverUrl);
                                    this.setState({showSettings: false});
                                }}>Save</Button>
                    </Grid>
                </DialogActions>
            </Dialog>
        </div>);
    }
}

export const LoginForm = connect((state) => ({
    serverUrl: state.listReducer.serverUrl
}), (dispatch) => ({
    changeServerUrl: bindActionCreators(CommonActions.changeServerUrl, dispatch),
    clearAlerts: bindActionCreators(MenuActions.clearAlerts, dispatch)
}), null, {withRef: true})(LoginFormInner);