import update from "react-addons-update";
import React from "react";
import * as url from "../Common/Url";
import {ifNoAuthorizedRedirect} from "../Pages/ListActions";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as TableActions from "../Table/TableActions";
import {AuthTokenUtils, Caches, Generator, OrgTypes} from "../Common/Utils";
import * as MenuActions from "../Pages/MenuFormActions";
import {FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import DomainAddOutlinedIcon from "@mui/icons-material/DomainAddOutlined";

export class OrganizationComponentInner extends React.Component {
    state = {
        create: false, locked: true, organization: {}, invalidFields: new Set()
    };

    handleChange = (e) => {
        this.setState(update(this.state, {
            organization: {[e.target.id]: {$set: e.target.value}},
        }));
    }

    getValidationState(field) {
        if (this.state.organization[field] == null || this.state.organization[field].length === 0) {
            this.state.invalidFields.add(field);
            return false;
        } else {
            this.state.invalidFields.delete(field);
            return true;
        }
    }

    lockCallback = (result) => {
        if (result === "success") {
            this.setState({locked: true});
        } else if (result === "warning") {
            this.setState({locked: false});
        }
    };

    componentWillUnmount() {
        if (this.state.organization["id"] != null && this.state.create === false) {
            this.props.lockUnlockRecord(this.props.serverUrl, Caches.ORGANIZATION_CACHE, this.state.organization["id"], "unlock", this.props.showNotification);
        }
    }

    updateData = () => {
        if (this.props.organization["id"] == null) {
            this.setState({
                organization: {
                    name: "", street: "", id: Generator.uuidv4(), zip: "", type: "2",
                }, create: true, locked: true,
            });
        } else {
            this.props.lockUnlockRecord(this.props.serverUrl, Caches.ORGANIZATION_CACHE, this.props.organization["id"], "lock", this.props.showNotification, this.lockCallback);
            let org = Object.assign({}, this.props.organization);
            org["type"] = OrgTypes.getEngType(this.props.organization["type"]);
            this.setState({organization: org, create: false});
        }
    }

    componentDidMount() {
        if (this.props.organization !== null) {
            this.updateData();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.organization !== prevProps.organization) {
            this.updateData();
        }
        if (prevProps.organization["id"] !== this.props.organization["id"]) {
            this.props.lockUnlockRecord(this.props.serverUrl, Caches.ORGANIZATION_CACHE, prevProps.organization["id"], "unlock", this.props.showNotification);
        }
    }

    saveOrganization = (toCreate) => {
        let isOk = false;
        let headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json; charset=utf-8");
        fetch(this.props.serverUrl + url.SAVE_ORGANIZATION, {
            method: "post", headers: headers, body: JSON.stringify(this.state.organization),
        })
            .then((response) => {
                ifNoAuthorizedRedirect(response);
                isOk = response.ok;
                return response.text();
            })
            .then((text) => {
                if (isOk) {
                    const result = JSON.parse(text);
                    this.props.onSuccess()
                    this.props.updateRow(result.data, Caches.ORGANIZATION_CACHE);
                    if (toCreate)
                        this.props.showCommonAlert("Organization created!")
                    else
                        this.props.showCommonAlert("Changes saved!")
                } else {
                    this.props.showCommonErrorAlert(text);
                }
            });
    };

    handleTypeChange = (e) => {
        this.setState(update(this.state, {
            organization: {[e.target.name]: {$set: e.target.value}},
        }));
    };

    getButton() {
        if (this.state.create) {
            return (<Button startIcon={<DomainAddOutlinedIcon/>}
                            variant="contained"
                            style={{width: "100%", height: "56px", minHeight: "56px"}}
                            disabled={this.state.invalidFields.size !== 0}
                            onClick={() => this.saveOrganization(this.state.create)}>
                Create organization
            </Button>);
        } else {
            return (<Button
                startIcon={<SaveIcon/>}
                variant="contained"
                style={{width: "100%", height: "56px", minHeight: "56px"}}
                onClick={() => this.saveOrganization(this.state.create)}
                disabled={this.state.invalidFields.size !== 0 || !this.state.locked}
            >
                Save organization
            </Button>);
        }
    }

    render() {
        return (<div style={{padding: "8px"}}>
            <div
                style={{
                    width: "50%", display: "inline-block", verticalAlign: "top", paddingRight: "4px",
                }}
            >
                <TextField
                    error={!this.getValidationState("name")}
                    id="name"
                    type="text"
                    label="Enter name"
                    variant="outlined"
                    autoComplete="off"
                    sx={{mt: 1, display: "flex", height: "80px"}}
                    value={this.state.organization["name"] ? this.state.organization["name"] : ""}
                    helperText={!this.getValidationState("name") ? "Required field!" : ""}
                    onChange={this.handleChange}
                />

                <TextField
                    error={!this.getValidationState("street")}
                    id="street"
                    type="text"
                    label="Enter address street"
                    variant="outlined"
                    autoComplete="off"
                    sx={{mt: 1, display: "flex", height: "90px"}}
                    value={this.state.organization["street"] ? this.state.organization["street"] : ""}
                    helperText={!this.getValidationState("street") ? "Required field!" : ""}
                    onChange={this.handleChange}
                />
            </div>
            <div
                style={{
                    width: "50%", display: "inline-block", verticalAlign: "top", paddingLeft: "4px",
                }}
            >
                <TextField
                    error={!this.getValidationState("zip")}
                    id="zip"
                    type="text"
                    label="Enter address zip"
                    variant="outlined"
                    autoComplete="off"
                    sx={{mt: 1, display: "flex", height: "80px"}}
                    value={this.state.organization["zip"] ? this.state.organization["zip"] : ""}
                    helperText={!this.getValidationState("zip") ? "Required field!" : ""}
                    onChange={this.handleChange}
                />
                <FormControl sx={{mt: 1, display: "flex", height: "90px"}}>
                    <InputLabel id="type-label">Type</InputLabel>
                    <Select
                        labelId="type-label"
                        name="type"
                        defaultValue=""
                        value={this.state.organization["type"] ? this.state.organization["type"] : "2"}
                        label="Type"
                        onChange={this.handleTypeChange}
                    >
                        <MenuItem value="0">Non profit</MenuItem>
                        <MenuItem value="1">Private</MenuItem>
                        <MenuItem value="2">Government</MenuItem>
                        <MenuItem value="3">Public</MenuItem>
                    </Select>
                </FormControl>
            </div>
            {this.getButton()}
        </div>);
    }
}

export const OrganizationComponent = connect((state) => ({
    showNotification: state.listReducer.showNotification,
    serverUrl: state.listReducer.serverUrl
}), (dispatch) => ({
    updateRow: bindActionCreators(TableActions.updateRow, dispatch),
    showCommonErrorAlert: bindActionCreators(MenuActions.showCommonErrorAlert, dispatch),
    showCommonAlert: bindActionCreators(MenuActions.showCommonAlert, dispatch),
    lockUnlockRecord: bindActionCreators(MenuActions.lockUnlockRecord, dispatch)
}), null, {withRef: true})(OrganizationComponentInner);