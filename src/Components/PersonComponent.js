import DialogContent from "@mui/material/DialogContent";
import update from "react-addons-update";
import React from "react";
import {ifNoAuthorizedRedirect} from "../Pages/ListActions";
import * as url from "../Common/Url";
import {AuthTokenUtils, Caches, ContactTypes, currencies, getPhoneRegEx} from "../Common/Utils";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as MenuActions from "../Pages/MenuFormActions";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Dialog,
    DialogActions,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import {ContentState, convertFromHTML, convertToRaw} from "draft-js"
import {stateToHTML} from "draft-js-export-html"
import Button from "@mui/material/Button";
import MUIRichTextEditor from "mui-rte";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import SaveIcon from "@mui/icons-material/Save";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ContactPageIcon from "@mui/icons-material/ContactPage";

require("../Common/style.css");

export class PersonComponentInner extends React.Component {

    constructor(props) {
        super(props);
        let resume = props.person["resume"] == null ? "<div/>" : props.person["resume"];
        let salaryPerson = props.person["salary"] == null ? "" : props.person["salary"].substring(0, props.person["salary"].length - 4)
        let currencyPerson = props.person["salary"] == null ? "USD" : props.person["salary"].substring(props.person["salary"].length - 3)
        this.state = {
            locked: true,
            person: props.person,
            contactList: [],
            invalidFields: new Set(),
            salary: salaryPerson,
            currency: currencyPerson,
            resume: this.convertHtmlToMarkUp(resume),
            show: false,
            expanded: "",
            idToDelete: null
        };
        this.editor = React.createRef();
    }

    handleChange = (e) => {
        this.setState(update(this.state, {person: {[e.target.id]: {$set: e.target.value}}}));
    }

    clearContactList = () => {
        this.setState(update(this.state, {contactList: {$set: []}}));
    };

    convertHtmlToMarkUp = (sourceHtml) => {
        const contentHTML = convertFromHTML(sourceHtml)
        const state = ContentState.createFromBlockArray(contentHTML.contentBlocks, contentHTML.entityMap)
        return JSON.stringify(convertToRaw(state))
    }

    onChangeResume = (_editorState) => {
        this._editorState = _editorState
    };

    getContactList = (id) => {
        let isOk = false;
        let headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json; charset=utf-8");
        fetch(this.props.serverUrl + url.GET_CONTACT_LIST + "?personId=" + id, {
            method: "get", headers: headers,
        })
            .then((response) => {
                ifNoAuthorizedRedirect(response);
                isOk = response.ok;
                return response.text();
            })
            .then((text) => {
                if (isOk) {
                    this.setState({contactList: JSON.parse(text).data.data});
                } else {
                    this.props.showCommonErrorAlert(text);
                }
            });
    };

    deleteContact = () => {
        let filteredContactList = this.state.contactList.filter(contact => contact.id !== this.state.idToDelete);
        this.state.invalidFields.delete(this.state.idToDelete + "&&data");
        this.state.invalidFields.delete(this.state.idToDelete + "&&description");
        this.setState({contactList: filteredContactList, idToDelete: null, show: false});
    };

    addEmptyContact = () => {
        let newContact = {
            id: Math.floor(Math.random() * 10000),
            personId: null,
            data: null,
            description: null,
            type: "0"
        }
        this.setState({contactList: [...this.state.contactList, newContact]});
    };

    saveContacts = (creation, personId, savedPerson) => {
        let isOk = false;
        let headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json; charset=utf-8");
        fetch(this.props.serverUrl + url.SAVE_CONTACT_LIST + "?personId=" + personId, {
            method: "post", headers: headers, body: JSON.stringify(this.state.contactList),
        })
            .then((response) => {
                ifNoAuthorizedRedirect(response);
                isOk = response.ok;
                return response.text();
            })
            .then((text) => {
                if (isOk) {
                    if (this.props.forUpdate) this.setState(update(this.state, {
                        person: {$set: savedPerson}, contactList: {$set: JSON.parse(text).data},
                    }));
                    if (creation) {
                        this.props.lockUnlockRecord(this.props.serverUrl, Caches.PERSON_CACHE, personId, "unlock", this.props.showNotification);
                        this.props.showCommonAlert("Person created!")
                        this.props.onUpdate(savedPerson);
                    } else {
                        this.props.showCommonAlert("Changes saved!")
                    }
                } else {
                    this.props.showCommonErrorAlert(text);
                }
            });
    };

    savePerson = () => {
        this.editor.current.save()
        let targetPerson = this.state.person
        targetPerson.resume = this.htmlResume
        let savedPerson;
        let creation = targetPerson.id == null;
        let headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json; charset=utf-8");
        let isOk = false;
        fetch(this.props.serverUrl + url.SAVE_PERSON, {
            method: "post", headers: headers, body: JSON.stringify(targetPerson),
        })
            .then((response) => {
                ifNoAuthorizedRedirect(response);
                isOk = response.ok;
                return response.text();
            })
            .then((text) => {
                if (isOk) {
                    savedPerson = JSON.parse(text).data;
                    let personId = creation ? savedPerson.id : targetPerson.id;
                    if (creation) {
                        this.props.lockUnlockRecord(this.props.serverUrl, Caches.PERSON_CACHE, personId, "lock", this.props.showNotification, (result) => {
                            if (result === "success") {
                                this.setState({locked: true});
                                this.saveContacts(creation, personId, savedPerson);
                            } else if (result === "warning") {
                                this.setState({locked: false});
                            }
                        });
                    } else {
                        this.saveContacts(creation, personId, savedPerson);
                    }
                } else {
                    this.props.showCommonErrorAlert(text);
                }
            });
    };

    lockCallback = (result) => {
        if (result === "success") {
            this.setState({locked: true});
        } else if (result === "warning") {
            this.setState({locked: false});
        }
    };

    getContactHeaderIcon(type) {
        switch (type) {
            case "0":
                return <PhoneIphoneIcon color={this.props.useDarkTheme ? "primary" : "topButtonColor"}/>
            case "1":
                return <LocalPhoneIcon color={this.props.useDarkTheme ? "primary" : "topButtonColor"}/>
            case "2":
                return <ApartmentIcon color={this.props.useDarkTheme ? "primary" : "topButtonColor"}/>
            case "3":
                return <AlternateEmailOutlinedIcon color={this.props.useDarkTheme ? "primary" : "topButtonColor"}/>
            default:
                return <div/>
        }
    }

    componentDidMount() {
        if (this.state.person["id"] != null && this.props.forUpdate) {
            this.getContactList(this.state.person["id"]);
            this.props.lockUnlockRecord(this.props.serverUrl, Caches.PERSON_CACHE, this.state.person["id"], "lock", this.props.showNotification, this.lockCallback);
        } else {
            this.clearContactList();
            this.setState({locked: true});
        }
    }

    componentWillUnmount() {
        if (this.props.forUpdate) this.props.lockUnlockRecord(this.props.serverUrl, Caches.PERSON_CACHE, this.state.person["id"], "unlock", this.props.showNotification);
    }

    handleChangeContact = (id, e) => {
        if (this.state.contactList == null || this.state.contactList.length === 0) return
        let filteredContacts = this.state.contactList.filter(contact => contact.id === id)
        if (filteredContacts.length === 0) return
        filteredContacts[0][e.target.name] = e.target.value
        if (e.target.name === "type") {
            this.getContactValidationState("data", id)
        }
        let newContactList = [...this.state.contactList]
        newContactList[this.state.contactList.findIndex(contact => contact.id === id)] = filteredContacts[0]
        this.setState({contactList: newContactList});
    }

    getContactComponent(contact) {
        return (<Accordion expanded={this.state.expanded === contact.id}
                           onChange={() => this.updateExpanded(contact.id)}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls="panel1a-content">
                {this.getContactHeaderIcon(contact.type)}<Typography
                sx={{ml: 1}}>{contact.personId == null ? "New contact" : ContactTypes.getEngType(contact.type)}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <FormControl fullWidth>
                    <InputLabel id="type-label">Type</InputLabel>
                    <Select
                        labelId="type-label"
                        id="type"
                        name="type"
                        value={contact.type}
                        label="Type"
                        onChange={this.handleChangeContact.bind(this, contact.id)}
                    >
                        <MenuItem value={"0"}>Mobile phone</MenuItem>
                        <MenuItem value={"1"}>Home phone</MenuItem>
                        <MenuItem value={"2"}>Address</MenuItem>
                        <MenuItem value={"3"}>E-mail</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    error={!this.getContactValidationState("data", contact.id)}
                    id="data"
                    type="text"
                    name="data"
                    value={contact.data}
                    label="Enter data"
                    variant="outlined"
                    autoComplete="off"
                    helperText={!this.getContactValidationState("data", contact.id) ?
                        (contact.type === "0" || contact.type === "1" ? "Invalid format!" : "Required field!") : ""}
                    sx={{mt: 5, display: "flex", height: "80px"}}
                    onChange={this.handleChangeContact.bind(this, contact.id)}
                />
                <TextField
                    error={!this.getContactValidationState("description", contact.id)}
                    id="description"
                    type="text"
                    name="description"
                    value={contact.description}
                    label="Enter description"
                    variant="outlined"
                    autoComplete="off"
                    helperText={!this.getContactValidationState("description", contact.id) ? "Required field!" : ""}
                    sx={{mt: 2, display: "flex", height: "80px"}}
                    onChange={this.handleChangeContact.bind(this, contact.id)}
                />
                <Button startIcon={<DeleteForeverIcon/>}
                        sx={{mt: 2, width: "100%", height: "56px"}}
                        onClick={() => this.setState({show: true, idToDelete: contact.id})}
                        variant="outlined"
                        color="error">
                    Delete contact
                </Button>
            </AccordionDetails>
        </Accordion>)
    }

    updateExpanded = (id) => {
        if (id === this.state.expanded) {
            this.setState({expanded: ""})
        } else {
            this.setState({expanded: id})
        }
    }

    getValidationState(field) {
        if (field === "salary") {
            if (this.state.person["salary"] == null || this.state.person["salary"].length === 3 || this.state.person["salary"].length === 4) {
                this.state.invalidFields.add(field);
                return false;
            }
        } else if (this.state.person[field] == null || this.state.person[field].trim().length === 0) {
            this.state.invalidFields.add(field);
            return false;
        }
        this.state.invalidFields.delete(field);
        return true;
    }

    getContactValidationState(field, id) {
        if (this.state.contactList == null || this.state.contactList.length === 0) return
        let filteredContacts = this.state.contactList.filter(contact => contact.id === id)
        if (filteredContacts.length === 0) return
        let targetContact = filteredContacts[0]
        if ((targetContact.type === "0" || targetContact.type === "1") && field === "data") {
            if (targetContact[field] == null || !getPhoneRegEx().test(targetContact[field].trim())) {
                this.state.invalidFields.add(id + "&&" + field);
                return false;
            }
        } else if (targetContact[field] == null || targetContact[field].trim().length === 0) {
            this.state.invalidFields.add(id + "&&" + field);
            return false;
        }
        this.state.invalidFields.delete(id + "&&" + field);
        return true;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.person !== prevProps.person) {
            if (this.state.person != null) {
                this.props.lockUnlockRecord(this.props.serverUrl, Caches.PERSON_CACHE, this.state.person["id"], "unlock", this.props.showNotification);
            }
            let newResume = this.props.person["resume"] == null ? "<div/>" : this.props.person["resume"];
            let salaryPerson = this.props.person["salary"] == null ? "" : this.props.person["salary"].substring(0, this.props.person["salary"].length - 4)
            let currencyPerson = this.props.person["salary"] == null ? "USD" : this.props.person["salary"].substring(this.props.person["salary"].length - 3)
            this.getContactList(this.props.person["id"]);
            this.setState({
                person: this.props.person,
                resume: this.convertHtmlToMarkUp(newResume),
                salary: salaryPerson,
                currency: currencyPerson
            });
            this.props.lockUnlockRecord(this.props.serverUrl, Caches.PERSON_CACHE, this.props.person["id"], "lock", this.props.showNotification, this.lockCallback);
        }
    }

    getCurrencyOptions() {
        let opts = []
        currencies.forEach(currency => opts.push(<MenuItem key={currency} value={currency}>{currency}</MenuItem>))
        return opts
    }

    getSalaryForm() {
        return (<div style={{height: "95px"}}>
            <div style={{width: "80%", display: "inline-block", height: "100%"}}>
                <TextField
                    error={!this.getValidationState("salary")}
                    id="salary"
                    type="text"
                    label="Enter annual salary"
                    variant="outlined"
                    autoComplete="off"
                    sx={{mt: 1, display: "flex", height: "80px"}}
                    value={this.state.salary}
                    helperText={!this.getValidationState("salary") ? "Required field!" : ""}
                    onChange={e => {
                        const re = /^[0-9\b]+$/;
                        if (e.currentTarget.value === "" || re.test(e.currentTarget.value)) {
                            let currentPerson = Object.assign({}, this.state.person)
                            currentPerson["salary"] = e.currentTarget.value + " " + this.state.currency
                            this.setState({salary: e.currentTarget.value, person: currentPerson})
                        }
                    }}
                />
            </div>
            <div style={{
                width: "20%",
                display: "inline-block",
                paddingLeft: "5px",
                height: "100%",
                verticalAlign: "top"
            }}>
                <FormControl fullWidth={true} sx={{mt: 1, display: "flex", height: "100%"}}>
                    <InputLabel id="currency-label">Currency</InputLabel>
                    <Select
                        labelId="currency-label"
                        id="currency"
                        name="currency"
                        value={this.state.currency}
                        label="Currency"
                        onChange={e => {
                            let currentPerson = Object.assign({}, this.state.person)
                            currentPerson["salary"] = this.state.salary + " " + e.target.value
                            this.setState({currency: e.target.value, person: currentPerson})
                        }}
                    >
                        {this.getCurrencyOptions()}
                    </Select>
                </FormControl>
            </div>
        </div>);
    }

    render() {
        let contacts = []
        this.state.contactList.forEach(contact => contacts.push(this.getContactComponent(contact)))
        return (<div>
            <div
                style={{
                    width: "calc(50% - 10px)",
                    display: "inline-block",
                    verticalAlign: "top",
                    marginLeft: "5px",
                    marginRight: "5px",
                }}
            >
                <TextField
                    error={!this.getValidationState("firstName")}
                    id="firstName"
                    type="text"
                    label="Enter first name"
                    value={this.state.person["firstName"]}
                    variant="outlined"
                    autoComplete="off"
                    sx={{mt: 1, display: "flex", height: "80px"}}
                    helperText={!this.getValidationState("firstName") ? "Required field!" : ""}
                    onChange={this.handleChange}
                />
                <TextField
                    error={!this.getValidationState("lastName")}
                    id="lastName"
                    type="text"
                    label="Enter last name"
                    value={this.state.person["lastName"]}
                    variant="outlined"
                    autoComplete="off"
                    sx={{mt: 1, display: "flex", height: "80px"}}
                    helperText={!this.getValidationState("lastName") ? "Required field!" : ""}
                    onChange={this.handleChange}
                />
                {this.getSalaryForm()}
                <MUIRichTextEditor
                    label="Resume"
                    ref={this.editor}
                    controls={["title", "bold", "italic", "underline", "strikethrough", "undo",
                        "redo", "link", "media", "numberList", "bulletList", "quote", "code", "clear"]}
                    onChange={this.onChangeResume}
                    value={this.state.resume}
                    onSave={() => {
                        this.htmlResume = stateToHTML(this._editorState.getCurrentContent())
                    }}
                />
                <Button
                    startIcon={<SaveIcon/>}
                    variant="contained"
                    sx={{mt: 4, width: "100%", height: "56px"}}
                    onClick={this.savePerson}
                    disabled={this.state.invalidFields.size !== 0 || !this.state.locked}
                >
                    Save data
                </Button>
            </div>
            <div
                style={{
                    width: "calc(50% - 10px)",
                    display: "inline-block",
                    verticalAlign: "top",
                    marginLeft: "5px",
                    marginRight: "5px",
                }}
            >
                <div>
                    <Button startIcon={<ContactPageIcon/>}
                            sx={{mt: 1, width: "100%", height: "56px", marginBottom: "30px"}}
                            variant="outlined"
                            onClick={this.addEmptyContact}>
                        Add contact
                    </Button>
                    {contacts}
                    <Dialog
                        open={this.state.show}
                        onClose={() => this.setState({show: false, idToDelete: null})}
                        aria-describedby="confirmation-modal-description"
                    >
                        <DialogTitle>Confirm contact deletion</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="confirmation-modal-description">
                                Delete this contact?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({show: false, idToDelete: null})}>Cancel</Button>
                            <Button variant="contained" color="error" onClick={this.deleteContact}>Delete</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </div>);
    }
}


export const PersonComponent = connect((state) => ({
    showNotification: state.listReducer.showNotification,
    serverUrl: state.listReducer.serverUrl
}), (dispatch) => ({
    showCommonErrorAlert: bindActionCreators(MenuActions.showCommonErrorAlert, dispatch),
    showCommonAlert: bindActionCreators(MenuActions.showCommonAlert, dispatch),
    lockUnlockRecord: bindActionCreators(MenuActions.lockUnlockRecord, dispatch)
}), null, {withRef: true})(PersonComponentInner);