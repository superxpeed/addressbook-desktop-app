import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Table} from "../Table/Table";
import * as CommonActions from "./ListActions";
import * as Url from "../Common/Url";
import * as Utils from "../Common/Utils";
import {Caches, HashUtils} from "../Common/Utils";
import * as TableActions from "../Table/TableActions";
import * as MenuActions from "./MenuFormActions";
import {OrganizationComponent} from "../Components/OrganizationComponent";
import {PersonComponent} from "../Components/PersonComponent";
import {NavBarComponent} from "../Components/NavBarComponent";
import {Box, IconButton, Tab, Tabs} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (<div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
    >
        {value === index && (<Box sx={{p: 3}}>
            {children}
        </Box>)}
    </div>);
}

export class ListFormInner extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
        this.state = {
            activeTab: 1,
        };
    }

    componentDidMount() {
        let currentUrl = window.location.hash;
        this.refreshTable(this.props.paginationOrganization.pageIndex + 1,
            this.props.paginationOrganization.pageSize,
            this.props.sortNameOrganization,
            this.props.sortOrderOrganization,
            Utils.convertFilterObj(this.props.filterObjOrganization, this.props.customFilterFnsOrganization),
            Caches.ORGANIZATION_CACHE);
        this.props.getBreadcrumbs(HashUtils.cleanHash(currentUrl));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.selectedRowsOrganization.length === 1 && (this.props.selectedRowsOrganization.length !== prevProps.selectedRowsOrganization.length || this.props.selectedRowsOrganization[0].id !== prevProps.selectedRowsOrganization[0].id)) {
            let converted = Utils.convertFilterObj(this.props.filterObjPerson, this.props.customFilterFnsPerson);
            converted = converted.filter((x) => x.name !== "orgId")
            converted.push({
                name: "orgId", value: this.props.selectedRowsOrganization[0].id, comparator: "", type: "TextFilter",
            });
            this.refreshTable(this.props.paginationPerson.pageIndex + 1,
                this.props.paginationPerson.pageSize,
                this.props.sortNamePerson,
                this.props.sortOrderPerson, converted, Caches.PERSON_CACHE);
            for (let i = 0; i < this.props.selectedRowsPerson.length; i++) {
                this.props.clearPersonSelection(this.props.selectedRowsPerson[i]);
            }
            this.setState({createNewPerson: false, newPerson: undefined});
        }

        if (this.props.selectedRowsOrganization.length === 0 && this.props.selectedRowsOrganization.length === 1) {
            for (let i = 0; i < this.props.selectedRowsPerson.length; i++) {
                this.props.clearPersonSelection(this.props.selectedRowsPerson[i]);
            }
            this.setState({createNewPerson: false, newPerson: undefined});
        }
    }

    personTabClosed = (tab) => {
        if (tab === this.state.activeTab) {
            this.setState({activeTab: tab - 1});
        }
    };

    refreshTable = (start, pageSize, sortName, sortOrder, filterDto, cache) => {
        if (cache === Caches.PERSON_CACHE && this.props.selectedRowsOrganization.length === 1) {
            if (filterDto != null && filterDto.length !== 0) {
                filterDto = filterDto.filter((x) => x.name !== "orgId");
            } else {
                filterDto = []
            }
            filterDto.push({
                name: "orgId", value: this.props.selectedRowsOrganization[0].id, comparator: "", type: "TextFilter",
            });
        }
        this.props.getList(Url.GET_LIST + "?start=" + start + "&pageSize=" + pageSize + "&sortName=" + sortName + "&sortOrder=" + sortOrder + "&cache=" + cache, filterDto, cache);
    };

    updateSelectedPerson = (person) => {
        this.props.updateRow(person, Caches.PERSON_CACHE);
        this.setState({createNewPerson: false, newPerson: undefined});
    };

    handleSelect(event, newValue) {
        this.setState({activeTab: newValue});
    }

    render() {
        let personTableTab;
        let personTableTabPanel;
        let newPersonTab;
        let newPersonTabPanel;
        let personsTabs = [];
        let personsTabPanels = [];
        let breads = Utils.getBreadcrumbsList(this.props.breadcrumbs, this.props.useDarkTheme)
        if (this.props.selectedRowsOrganization.length === 1) {
            personTableTab = (<Tab
                key={2}
                label={this.props.selectedRowsOrganization[0].name}
                value={2}
            />);
            personTableTabPanel = <TabPanel value={this.state.activeTab} index={2}>
                <Table
                    customFilterFns={this.props.customFilterFnsPerson}
                    sortName={this.props.sortNamePerson}
                    sortOrder={this.props.sortOrderPerson}
                    pagination={this.props.paginationPerson}
                    filterObj={this.props.filterObjPerson}
                    selectMode="multi"
                    refreshTable={this.refreshTable}
                    cache={Caches.PERSON_CACHE}
                    isLoading={this.props.tableDataPersonLoading}
                    selectedRows={this.props.selectedRowsPerson}
                    data={this.props.tableDataPerson.data}
                    totalDataSize={this.props.totalDataSizePerson}
                    fieldDescriptionMap={this.props.fieldDescriptionMapPerson}
                    parent={this}
                />
            </TabPanel>;
            let key = 0;
            for (let i = 0; i < this.props.selectedRowsPerson.length; i++) {
                key = i + 3;
                let personLocal = this.props.selectedRowsPerson[i];
                personsTabs.push(<Tab
                    value={key}
                    key={key}
                    iconPosition="end"
                    label={this.props.selectedRowsPerson[i].firstName}
                    icon={<IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.props.syncSelectedRows(this.props.selectedRowsPerson.filter((it) => it.id !== personLocal.id).map((x) => x.id).reduce((a, v) => ({
                                ...a,
                                [v]: true
                            }), {}), Caches.PERSON_CACHE);
                            this.personTabClosed(key);
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>}/>);
                personsTabPanels.push(<TabPanel value={this.state.activeTab} index={key}>
                    <PersonComponent
                        forUpdate={true}
                        person={this.props.selectedRowsPerson[i]}
                        onUpdate={this.updateSelectedPerson}
                    />
                </TabPanel>);
            }
            if (this.state.createNewPerson === true) {
                if (key === 0) key = 3; else key++;
                newPersonTab = (<Tab
                    value={key}
                    key={key}
                    iconPosition="end"
                    label={"New person"}
                    icon={<IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.setState({
                                createNewPerson: false, newPerson: undefined,
                            });
                            this.personTabClosed(key);
                        }}>
                        <CloseIcon/>
                    </IconButton>}/>);
                newPersonTabPanel = (<TabPanel value={this.state.activeTab} index={key}>
                    <PersonComponent
                        forUpdate={false}
                        person={this.state.newPerson}
                        onUpdate={this.updateSelectedPerson}/>
                </TabPanel>);
            } else {
                newPersonTab = <div/>;
                newPersonTabPanel = <div/>;
            }
            if (key === 0) {
                this.lastKey = 2
            } else {
                this.lastKey = key
            }
        } else {
            personTableTab = <div/>;
            personTableTabPanel = <div/>;
        }

        return (<div>
            <NavBarComponent breads={breads}>
                <Button
                    startIcon={<GroupAddIcon/>}
                    variant="contained"
                    color={this.props.useDarkTheme ? "primary" : "topButtonColor"}
                    style={{marginRight: "5px"}}
                    disabled={this.props.selectedRowsOrganization.length !== 1 || this.state.createNewPerson === true}
                    onClick={() => this.setState({
                        activeTab: this.lastKey + 1,
                        createNewPerson: true, newPerson: {
                            orgId: this.props.selectedRowsOrganization[0].id,
                        }
                    })}
                >
                    Create person
                </Button>
            </NavBarComponent>
            <Box sx={{width: "100%"}}>
                <Box sx={{borderBottom: 1, borderColor: "divider"}}>
                    <Tabs
                        value={this.state.activeTab}
                        onChange={this.handleSelect}
                        aria-label="basic tabs example"
                        id="tables"
                    >
                        <Tab label="Organizations" key={1} value={1} sx={{height: "80px"}}/>
                        {personTableTab}
                        {personsTabs}
                        {newPersonTab}
                    </Tabs>
                </Box>
                <TabPanel value={this.state.activeTab} index={1}>
                    <div style={{marginBottom: "1px", border: "1px solid rgba(81, 81, 81, 1)", borderRadius: "5px"}}>
                        <OrganizationComponent
                            onSuccess={() => this.refreshTable(this.props.paginationOrganization.pageIndex + 1,
                                this.props.paginationOrganization.pageSize,
                                this.props.sortNameOrganization,
                                this.props.sortOrderOrganization,
                                Utils.convertFilterObj(this.props.filterObjOrganization, this.props.customFilterFnsOrganization),
                                Caches.ORGANIZATION_CACHE)}
                            organization={this.props.selectedRowsOrganization.length === 1 ? this.props.selectedRowsOrganization[0] : {}}
                        />
                    </div>
                    <Table
                        customFilterFns={this.props.customFilterFnsOrganization}
                        sortName={this.props.sortNameOrganization}
                        sortOrder={this.props.sortOrderOrganization}
                        pagination={this.props.paginationOrganization}
                        filterObj={this.props.filterObjOrganization}
                        refreshTable={this.refreshTable}
                        cache={Caches.ORGANIZATION_CACHE}
                        selectMode="single"
                        isLoading={this.props.tableDataOrganizationLoading}
                        selectedRows={this.props.selectedRowsOrganization}
                        data={this.props.tableDataOrganization.data}
                        totalDataSize={this.props.totalDataSizeOrganization}
                        fieldDescriptionMap={this.props.fieldDescriptionMapOrganization}
                        parent={this}
                    />
                </TabPanel>
                {personTableTabPanel}
                {personsTabPanels}
                {newPersonTabPanel}
            </Box>
        </div>);
    }
}


export const ListForm = connect((state) => ({
    customFilterFnsOrganization: state.listReducer.customFilterFnsOrganization,
    customFilterFnsPerson: state.listReducer.customFilterFnsPerson,
    sortNameOrganization: state.listReducer.sortNameOrganization,
    sortOrderOrganization: state.listReducer.sortOrderOrganization,
    paginationOrganization: state.listReducer.paginationOrganization,
    filterObjOrganization: state.listReducer.filterObjOrganization,
    sortNamePerson: state.listReducer.sortNamePerson,
    sortOrderPerson: state.listReducer.sortOrderPerson,
    paginationPerson: state.listReducer.paginationPerson,
    filterObjPerson: state.listReducer.filterObjPerson,
    tableDataOrganization: state.listReducer.tableDataOrganization,
    fieldDescriptionMapOrganization: state.listReducer.fieldDescriptionMapOrganization,
    tableDataOrganizationLoading: state.listReducer.tableDataOrganizationLoading,
    tableDataPersonLoading: state.listReducer.tableDataPersonLoading,
    totalDataSizeOrganization: state.listReducer.totalDataSizeOrganization,
    tableDataPerson: state.listReducer.tableDataPerson,
    fieldDescriptionMapPerson: state.listReducer.fieldDescriptionMapPerson,
    totalDataSizePerson: state.listReducer.totalDataSizePerson,
    selectedRowsPerson: state.listReducer.selectedRowsPerson,
    selectedRowsOrganization: state.listReducer.selectedRowsOrganization,
    useDarkTheme: state.listReducer.useDarkTheme,
    breadcrumbs: state.menuReducer.breadcrumbs
}), (dispatch) => ({
    getList: bindActionCreators(CommonActions.getList, dispatch),
    onSelectRow: bindActionCreators(TableActions.onSelectRow, dispatch),
    syncSelectedRows: bindActionCreators(TableActions.syncSelectedRows, dispatch),
    updateRow: bindActionCreators(TableActions.updateRow, dispatch),
    getBreadcrumbs: bindActionCreators(MenuActions.getBreadcrumbs, dispatch),
    clearPersonSelection: bindActionCreators(CommonActions.clearPersonSelection, dispatch)
}), null, {withRef: true})(ListFormInner);