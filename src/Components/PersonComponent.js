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
    Avatar,
    Box,
    Dialog,
    DialogActions,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel, Link,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
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
import {FileUploadOutlined} from "@mui/icons-material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
const { ipcRenderer } = window;

require("../Common/style.css");

function CircularProgressWithLabel(props) {

    let progressMessage = "Uploading..."

    if (Math.round(props.value) === 100) {
        progressMessage = "Finishing up..."
    }

    return (<div style={{textAlign: "center", width: "300px"}}>
        <Box sx={{position: "relative", display: "inline-flex"}}>
            <CircularProgress variant="determinate" {...props} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary">
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
        <Typography
            variant="caption"
            component="div"
            color="text.secondary">
            {progressMessage}
        </Typography>
    </div>);
}

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
            documentList: [],
            invalidFields: new Set(),
            salary: salaryPerson,
            currency: currencyPerson,
            resume: this.convertHtmlToMarkUp(resume),
            showContactDeletionDialog: false,
            showDocumentDeletionDialog: false,
            expanded: "",
            contactIdToDelete: null,
            documentIdToDelete: null,
            uploadInProgress: false,
            percentCompleted: 0
        };
        this.editor = React.createRef();
    }

    getFileList = () => {
        let documents = []
        if (this.state.documentList == null || this.state.documentList.length === 0) {
            return (<Typography style={{marginTop: "37px"}}
                                color="primary"
                                align="center"
                                variant="h6"
                                gutterBottom>
                NO DOCUMENTS
            </Typography>)
        }
        this.state.documentList.forEach(document => {
            documents.push(
                <ListItem
                    secondaryAction={
                        <IconButton
                            color="primary"
                            onClick={() => this.setState({
                                documentIdToDelete: document.id,
                                showDocumentDeletionDialog: true
                            })}
                            edge="end"
                            aria-label="delete">
                            <DeleteIcon/>
                        </IconButton>
                    }
                >
                    <Link onClick={() => this.saveFile(document.url, document.name)}
                          component="button">
                        <ListItemAvatar>
                            <Avatar>
                                <CloudDownloadIcon color="primary"/>
                            </Avatar>
                        </ListItemAvatar>
                    </Link>
                    <ListItemText
                        primary={document.name}
                        primaryTypographyProps={{ style: { wordWrap: "break-word" } }}
                        secondary={document.createDate + " | " + document.size}
                    />
                </ListItem>
            )
            documents.push(<Divider/>)
        })
        return <List dense={true}>
            {documents}
        </List>
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

    deleteDocument = () => {
        let personId = this.state.person.id;
        let isOk = false;
        let headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json; charset=utf-8");
        fetch(this.props.serverUrl + url.DELETE_DOCUMENT + "?id=" + this.state.documentIdToDelete, {
            method: "get", headers: headers,
        })
            .then((response) => {
                ifNoAuthorizedRedirect(response);
                isOk = response.ok;
                return response.text();
            })
            .then((text) => {
                if (isOk) {
                    this.setState({documentIdToDelete: null, showDocumentDeletionDialog: false});
                    this.getDocumentList(personId);
                } else {
                    this.props.showCommonErrorAlert(text);
                }
            });
    };

    getDocumentList = (id) => {
        let isOk = false;
        let headers = new Headers();
        AuthTokenUtils.addAuthToken(headers);
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json; charset=utf-8");
        fetch(this.props.serverUrl + url.GET_DOCUMENT_LIST + `?personId=${id}&origin=${this.props.serverUrl}`, {
            method: "get", headers: headers,
        })
            .then((response) => {
                ifNoAuthorizedRedirect(response);
                isOk = response.ok;
                return response.text();
            })
            .then((text) => {
                if (isOk) {
                    this.setState({documentList: JSON.parse(text).data.data});
                } else {
                    this.props.showCommonErrorAlert(text);
                }
            });
    };

    deleteContact = () => {
        let filteredContactList = this.state.contactList.filter(contact => contact.id !== this.state.contactIdToDelete);
        this.state.invalidFields.delete(this.state.contactIdToDelete + "&&data");
        this.state.invalidFields.delete(this.state.contactIdToDelete + "&&description");
        this.setState({contactList: filteredContactList, contactIdToDelete: null, showContactDeletionDialog: false});
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
            this.getDocumentList(this.state.person["id"]);
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
                        onClick={() => this.setState({showContactDeletionDialog: true, contactIdToDelete: contact.id})}
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
            this.getDocumentList(this.props.person["id"]);
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
                paddingLeft: "8px",
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

    saveFile(url, name) {
        ipcRenderer.send("download", {
            url: url,
            filename: name
        });
        ipcRenderer.receive("download complete", (file) => {
            this.props.showCommonAlert("Download complete")
            ipcRenderer.removeAllListeners("download complete");
        });
    }

    handleDocumentUpload = (e) => {
        e.preventDefault();
        let personId = this.state.person.id;
        this.setState({uploadInProgress: true, percentCompleted: 0})
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        let headers = {
            "Content-Type": "multipart/form-data"
        };
        AuthTokenUtils.addAuthTokenFormData(headers);
        axios.post(this.props.serverUrl + url.UPLOAD_DOCUMENT + "?personId=" + personId, formData, {
            headers: headers,
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                this.setState({percentCompleted: percentCompleted})
            },
        }).then((response) => {
            this.setState({uploadInProgress: false})
            this.getDocumentList(personId)
            return response.data;
        }).catch((error) => {
            if (error.response) {
                if (error.response.status === 413) {
                    this.props.showCommonTextErrorAlert("This document is too large to upload");
                } else {
                    this.props.showAxiosErrorAlert(error.response.data);
                }
            }
            this.setState({uploadInProgress: false})
        });
    }

    getUploadElement = () => {
        let targetElement = <div/>
        if (this.state.uploadInProgress === true) {
            targetElement = <CircularProgressWithLabel value={this.state.percentCompleted}/>
        } else {
            targetElement = <Button startIcon={<FileUploadOutlined/>}
                                    sx={{height: "56px", width: "100%",}}
                                    component="label"
                                    variant="outlined"
                                    disabled={this.state.person.id == null}>
                Upload document
                <input hidden accept=".xlsx,.xls,image/*,.doc,.docx,.ppt,.pptx,.txt,.pdf"
                       name="file"
                       onChange={this.handleDocumentUpload}
                       type="file"/>
            </Button>
        }
        return <Grid container
                     justifyContent="center"
                     alignItems="center"
                     sx={{
                         height: "56px",
                         width: "100%",
                         marginTop: "30px",
                         marginBottom: "20px"
                     }}>
            {targetElement}
        </Grid>
    }

    render() {
        let contacts = []
        this.state.contactList.forEach(contact => contacts.push(this.getContactComponent(contact)))
        if (this.state.contactList == null || this.state.contactList.length === 0) {
            contacts = []
            contacts.push(<Typography color="primary"
                                      style={{marginTop: "7px"}}
                                      align="center"
                                      variant="h6"
                                      gutterBottom>
                NO CONTACTS
            </Typography>)
        }
        return (<div>
            <div
                style={{
                    width: "calc(50% - 8px)",
                    display: "inline-block",
                    verticalAlign: "top",
                    marginLeft: "4px",
                    marginRight: "4px",
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
                    width: "calc(50% - 8px)",
                    display: "inline-block",
                    verticalAlign: "top",
                    marginLeft: "4px",
                    marginRight: "4px",
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
                    {this.getUploadElement()}
                    {this.getFileList()}
                    <Dialog
                        open={this.state.showContactDeletionDialog}
                        onClose={() => this.setState({showContactDeletionDialog: false, contactIdToDelete: null})}
                        aria-describedby="confirmation-modal-description"
                    >
                        <DialogTitle>Confirm contact deletion</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="confirmation-modal-description">
                                Delete this contact?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({
                                showContactDeletionDialog: false,
                                contactIdToDelete: null
                            })}>Cancel</Button>
                            <Button variant="contained" color="error" onClick={this.deleteContact}>Delete</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={this.state.showDocumentDeletionDialog}
                        onClose={() => this.setState({showDocumentDeletionDialog: false, documentIdToDelete: null})}
                        aria-describedby="confirmation-modal-description"
                    >
                        <DialogTitle>Confirm document deletion</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="confirmation-modal-description">
                                Delete this document?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({
                                showDocumentDeletionDialog: false,
                                documentIdToDelete: null
                            })}>Cancel</Button>
                            <Button variant="contained" color="error" onClick={this.deleteDocument}>Delete</Button>
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
    showCommonTextErrorAlert: bindActionCreators(MenuActions.showCommonTextErrorAlert, dispatch),
    showAxiosErrorAlert: bindActionCreators(MenuActions.showAxiosErrorAlert, dispatch),
    showCommonAlert: bindActionCreators(MenuActions.showCommonAlert, dispatch),
    lockUnlockRecord: bindActionCreators(MenuActions.lockUnlockRecord, dispatch)
}), null, {withRef: true})(PersonComponentInner);