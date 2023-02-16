import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as TableActions from "./TableActions";
import MaterialReactTable from "material-react-table";
import {Box, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import {ExportToCsv} from "export-to-csv";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import * as Utils from "../Common/Utils";
import {DateComparators} from "../Common/Utils";

export class TableInner extends React.Component {

    static html2text = (html) => {
        let tag = document.createElement("div");
        tag.innerHTML = html;
        return tag.innerText;
    };

    onSortChange = (sortingState) => {
        let newSortName = "id"
        let newSortOrder = "desc"
        if (sortingState() != null && sortingState().length !== 0) {
            newSortName = sortingState()[0].id
            newSortOrder = sortingState()[0].desc ? "desc" : "asc"
            if (this.props.sortName === newSortName && this.props.sortOrder === newSortOrder) return
        }
        this.props.onSortingChange(newSortName, newSortOrder, this.props.cache);
        this.props.refreshTable(this.props.pagination.pageIndex + 1, this.props.pagination.pageSize, newSortName, newSortOrder, Utils.convertFilterObj(this.props.filterObj, this.props.customFilterFns), this.props.cache);
    };

    componentDidMount() {
        this.props.refreshTable(this.props.pagination.pageIndex + 1, this.props.pagination.pageSize, this.props.sortName, this.props.sortOrder, Utils.convertFilterObj(this.props.filterObj, this.props.customFilterFns), this.props.cache);
    }

    onFilterChange = (updater) => {
        this.props.onFilterChange(updater(this.props.filterObj), this.props.cache);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (JSON.stringify(this.props.filterObj) !== JSON.stringify(prevProps.filterObj)) {
            this.props.refreshTable(this.props.pagination.pageIndex + 1, this.props.pagination.pageSize, this.props.sortName, this.props.sortOrder, Utils.convertFilterObj(this.props.filterObj, this.props.customFilterFns), this.props.cache);
        }
    }

    onPaginationChange = (updater) => {
        const nextState = updater(this.props.pagination);
        if (this.props.pagination.pageIndex !== nextState.pageIndex || this.props.pagination.pageSize !== nextState.pageSize) {
            this.props.onPaginationChange({
                pageIndex: nextState.pageIndex,
                pageSize: nextState.pageSize
            }, this.props.cache);
            this.props.refreshTable(nextState.pageIndex + 1, nextState.pageSize, this.props.sortName, this.props.sortOrder, Utils.convertFilterObj(this.props.filterObj, this.props.customFilterFns), this.props.cache);
        }
    };

    onSelectTableRow = (updater) => {
        const nextState = updater(this.props.selectedRows.map((x) => x.id).reduce((a, v) => ({...a, [v]: true}), {}));
        this.props.onSelectRow(nextState, this.props.cache);
    };

    getCellFormatter = (fieldName) => {
        if (fieldName === "resume")
            return function Formatter({cell}) {
                return <div style={{whiteSpace: "initial"}}
                            title={Table.html2text(cell.getValue())}>{Table.html2text(cell.getValue())}</div>
            }
        if (fieldName === "salary") {
            let targetBoxColor = this.props.useDarkTheme ? "#90caf9" : "#9c27b0"
            let targetTextColor = this.props.useDarkTheme ? "#000000" : "#FFFFFF"
            return function Formatter({cell}) {
                return <Box
                    sx={{
                        backgroundColor: targetBoxColor,
                        borderRadius: "0.25rem",
                        color: targetTextColor,
                        p: "0.25rem",
                    }}
                >
                    {cell.getValue()}
                </Box>
            }
        }
        return function Formatter({cell}) {
            return <div style={{whiteSpace: "initial"}} title={cell.getValue()}>{cell.getValue()}</div>
        }
    }

    getColumnDefinition = (columnMetaData) => {

        if (columnMetaData.name === "type") {
            return {
                accessorKey: columnMetaData.name,
                header: columnMetaData.displayName,
                minSize: columnMetaData.width,
                Cell: this.getCellFormatter(columnMetaData.name),
                columnFilterModeOptions: ["equals"],
                filterFn: "equals",
                filterVariant: "select",
                filterSelectOptions: [{text: "Non profit", value: "0"},
                    {text: "Private", value: "1"},
                    {text: "Government", value: "2"},
                    {text: "Public", value: "3"}]
            }
        }

        if (columnMetaData.type === "java.lang.String") {
            return {
                accessorKey: columnMetaData.name,
                header: columnMetaData.displayName,
                minSize: columnMetaData.width,
                Cell: this.getCellFormatter(columnMetaData.name),
                filterFn: "contains",
                columnFilterModeOptions: ["contains"]
            }
        }

        if (columnMetaData.type === "java.util.Date") {
            return {
                accessorKey: columnMetaData.name,
                header: columnMetaData.displayName,
                minSize: columnMetaData.width,
                filterFn: "equals",
                Cell: this.getCellFormatter(columnMetaData.name),
                columnFilterModeOptions: ["equals", "notEquals", "greaterThan", "greaterThanOrEqualTo", "lessThan", "lessThanOrEqualTo"],
                Filter: ({column}) => (<LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        inputFormat="YYYY-MM-DD"
                        onChange={(newValue) => {
                            column.setFilterValue(newValue);
                        }}
                        renderInput={(params) => (<TextField
                            {...params}
                            sx={{mt: 1, minWidth: "110px"}}
                            helperText={"Filter Mode: " + DateComparators.getEngType(column.getFilterFn().name)}
                            variant="outlined"
                        />)}
                        value={column.getFilterValue()}
                    />
                </LocalizationProvider>)
            }
        }

        return {
            accessorKey: columnMetaData.name,
            header: columnMetaData.displayName,
            minSize: columnMetaData.width,
            Cell: this.getCellFormatter(columnMetaData.name)
        }
    }

    render() {
        let columns = null;
        if ((this.props.fieldDescriptionMap != null && Object.keys(this.props.fieldDescriptionMap).length !== 0) || this.props.fieldDescriptionMap.constructor !== Object) {
            columns = Object.keys(this.props.fieldDescriptionMap).filter(key => key !== "orgId").map((key) => this.getColumnDefinition(this.props.fieldDescriptionMap[key]));
        }
        let materialTable;
        if (columns != null) {
            const csvOptions = {
                fieldSeparator: ",",
                quoteStrings: "\"",
                filename: "addressbook_export_" + new Date().toISOString().replace(/-/g, "_"),
                decimalSeparator: ".",
                showLabels: true,
                useBom: true,
                useKeysAsHeaders: false,
                headers: columns.map((c) => c.header),
            };
            const csvExporter = new ExportToCsv(csvOptions);
            materialTable = (<MaterialReactTable
                data={this.props.data}
                columns={columns}
                enableRowSelection
                enableMultiRowSelection={this.props.selectMode === "multi"}
                positionToolbarAlertBanner={this.props.selectMode === "multi" ? "bottom" : "none"}
                onColumnFiltersChange={this.onFilterChange}
                onPaginationChange={this.onPaginationChange}
                onSortingChange={this.onSortChange}
                manualPagination
                manualSorting
                manualFiltering
                enableClickToCopy={true}
                enableGlobalFilter={false}
                getRowId={(originalRow) => originalRow.id}
                enableMultiSort={false}
                enableHiding={false}
                enableFullScreenToggle={false}
                enableColumnFilterModes={true}
                enableSelectAll={false}
                muiTableProps={{
                    sx: {
                        tableLayout: "fixed",
                    },
                }}
                onColumnFilterFnsChange={(updater) => {
                    this.props.onCustomFilterFn(updater(this.props.customFilterFns), this.props.cache)
                }}
                onRowSelectionChange={this.onSelectTableRow}
                rowCount={this.props.totalDataSize}
                renderTopToolbarCustomActions={({table}) => (<Box
                    sx={{display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap"}}
                >
                    <Button
                        disabled={table.getRowModel().rows.length === 0}
                        onClick={() => csvExporter.generateCsv(table.getRowModel().rows.map((row) => row.original))}
                        startIcon={<FileDownloadIcon/>}
                        variant="contained"
                    >
                        Export Page Rows
                    </Button>
                    <Button
                        disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                        onClick={() => csvExporter.generateCsv(table.getSelectedRowModel().rows.map((row) => row.original))}
                        startIcon={<FileDownloadIcon/>}
                        variant="contained"
                    >
                        Export Selected Rows
                    </Button>
                </Box>)}
                muiTablePaginationProps={{
                    rowsPerPageOptions: [10, 15, 25, 50],
                    showFirstButton: true,
                    showLastButton: true,
                }}
                muiTableHeadCellFilterTextFieldProps={{
                    sx: {m: "0.5rem 0", width: "100%"},
                    variant: "outlined",
                }}
                muiTableBodyRowProps={({row}) => ({
                    onClick: row.getToggleSelectedHandler(),
                    sx: {cursor: "pointer"},
                })}
                state={{
                    columnFilterFns: this.props.customFilterFns,
                    columnFilters: this.props.filterObj,
                    sorting: [{id: this.props.sortName, desc: this.props.sortOrder === "desc"}],
                    pagination: this.props.pagination,
                    rowSelection: this.props.selectedRows.map((x) => x.id).reduce((a, v) => ({...a, [v]: true}), {}),
                    showProgressBars: this.props.isLoading
                }}
                initialState={{
                    density: "compact",
                    showColumnFilters: true,
                    pagination: this.props.pagination,
                    sorting: [{id: this.props.sortName, desc: this.props.sortOrder === "desc"}]
                }}
            />);
        } else {
            materialTable = <div/>;
        }
        return <div>{materialTable}</div>;
    }
}

export const Table = connect((state) => ({
    useDarkTheme: state.listReducer.useDarkTheme
}), (dispatch) => ({
    onSelectRow: bindActionCreators(TableActions.onSelectRow, dispatch),
    onPaginationChange: bindActionCreators(TableActions.onPaginationChange, dispatch),
    onFilterChange: bindActionCreators(TableActions.onFilterChange, dispatch),
    onSortingChange: bindActionCreators(TableActions.onSortingChange, dispatch),
    onCustomFilterFn: bindActionCreators(TableActions.onCustomFilterFn, dispatch)
}), null, {withRef: true})(TableInner);