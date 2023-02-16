import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {EventSourcePolyfill} from "event-source-polyfill";
import {styled} from "@mui/material/styles";
import MuiTableCell from "@mui/material/TableCell";
import ComputerIcon from "@mui/icons-material/Computer";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import {Chip, Container, Grid, Paper, Table, TableBody, TableContainer, TableRow} from "@mui/material";
import {NavBarComponent} from "../Components/NavBarComponent";
import {getBreadcrumbsList, HashUtils} from "../Common/Utils";
import * as MenuActions from "./MenuFormActions";
import WavesIcon from "@mui/icons-material/Waves";
import StorageIcon from "@mui/icons-material/Storage";
import MemoryIcon from "@mui/icons-material/Memory";

const TableCell = styled(MuiTableCell)({
    width: "50%",
    maxWidth: "50%",
    overflow: "hidden",
    textOverflow: "ellipsis",
});

export class AdminFormInner extends React.Component {
    state = {
        jvmState: {},
    };

    componentDidMount() {
        const EventSource = EventSourcePolyfill;
        const currentUrl = window.location.hash;
        this.props.getBreadcrumbs(HashUtils.cleanHash(currentUrl));
        const token = window.sessionStorage.getItem("auth-token");
        const newEventSource = new EventSource("/rest/admin/jvmState", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        newEventSource.onopen = () => console.log("Connection opened for JVM state");
        newEventSource.onmessage = (e) => this.setState({jvmState: JSON.parse(e.data)});
        newEventSource.onerror = () => {
            if (this.state.eventSource.readyState === EventSource.CONNECTING) {
                console.log("Reconnecting to JVM event source");
            } else {
                console.log(`Error: ${this.state.eventSource.readyState}`);
            }
        };

        this.setState({
            eventSource: newEventSource,
        });
    }

    componentWillUnmount() {
        this.state.eventSource.close();
    }

    render() {
        const breads = getBreadcrumbsList(this.props.breadcrumbs, this.props.useDarkTheme)
        return (<div>
                <NavBarComponent breads={breads}/>
                <Container maxWidth="sm">
                    <Grid container sx={{justifyContent: "center"}}>
                        <Chip icon={<DeveloperBoardIcon/>} color="primary" label="RUNTIME" sx={{m: 2, width: "100%"}}/>
                    </Grid>
                    <TableContainer component={Paper}>
                        <Table aria-label="dense table">
                            <TableBody>
                                <TableRow component="th">
                                    <TableCell>TOTAL MEMORY</TableCell>
                                    <TableCell>{this.state.jvmState.runtimeTotalMemory}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>FREE MEMORY</TableCell>
                                    <TableCell>{this.state.jvmState.runtimeFreeMemory}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>MAX MEMORY</TableCell>
                                    <TableCell>{this.state.jvmState.runtimeMaxMemory}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Grid container sx={{justifyContent: "center"}}>
                        <Chip icon={<ComputerIcon/>} color="primary" label="SYSTEM" sx={{m: 2, width: "100%"}}/>
                    </Grid>
                    <TableContainer component={Paper}>
                        <Table aria-label="dense table">
                            <TableBody>
                                <TableRow component="th">
                                    <TableCell>AVAILABLE PROCESSORS</TableCell>
                                    <TableCell>{this.state.jvmState.availableProcessors}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>LOAD AVERAGE</TableCell>
                                    <TableCell>{this.state.jvmState.systemLoadAverage}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>ARCHITECTURE</TableCell>
                                    <TableCell>{this.state.jvmState.arch}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>OPERATING SYSTEM</TableCell>
                                    <TableCell>{this.state.jvmState.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>OPERATING SYSTEM VERSION</TableCell>
                                    <TableCell>{this.state.jvmState.version}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>TOTAL PHYSICAL MEMORY</TableCell>
                                    <TableCell>{this.state.jvmState.totalPhysicalMemory}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>TOTAL CPU LOAD</TableCell>
                                    <TableCell>{this.state.jvmState.totalCpuLoad}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>DISK SIZE</TableCell>
                                    <TableCell>{this.state.jvmState.diskSize}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>OS USER</TableCell>
                                    <TableCell>{this.state.jvmState.user}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Grid container sx={{justifyContent: "center"}}>
                        <Chip icon={<StorageIcon/>} color="primary" label="HEAP" sx={{m: 2, width: "100%"}}/>
                    </Grid>
                    <TableContainer component={Paper}>
                        <Table aria-label="dense table">
                            <TableRow component="th">
                                <TableCell>USED</TableCell>
                                <TableCell>{this.state.jvmState.heapMemoryUsed}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>INITIAL</TableCell>
                                <TableCell>{this.state.jvmState.heapMemoryInit}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>COMMITTED</TableCell>
                                <TableCell>{this.state.jvmState.heapMemoryCommitted}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>MAX</TableCell>
                                <TableCell>{this.state.jvmState.heapMemoryMax}</TableCell>
                            </TableRow>
                        </Table>
                    </TableContainer>
                    <Grid container sx={{justifyContent: "center"}}>
                        <Chip icon={<MemoryIcon/>} color="primary" label="NON-HEAP" sx={{m: 2, width: "100%"}}/>
                    </Grid>
                    <TableContainer component={Paper}>
                        <Table aria-label="dense table">
                            <TableRow component="th">
                                <TableCell>USED</TableCell>
                                <TableCell>{this.state.jvmState.nonHeapMemoryUsed}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>INITIAL</TableCell>
                                <TableCell>{this.state.jvmState.nonHeapMemoryInit}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>COMMITTED</TableCell>
                                <TableCell>{this.state.jvmState.nonHeapMemoryCommitted}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>MAX</TableCell>
                                <TableCell>{this.state.jvmState.nonHeapMemoryMax}</TableCell>
                            </TableRow>
                        </Table>
                    </TableContainer>
                    <Grid container sx={{justifyContent: "center"}}>
                        <Chip icon={<WavesIcon/>} color="primary" label="THREADS" sx={{m: 2, width: "100%"}}/>
                    </Grid>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableRow component="th">
                                <TableCell>CURRENT THREAD COUNT</TableCell>
                                <TableCell>{this.state.jvmState.threadCount}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>TOTAL STARTED THREAD COUNT</TableCell>
                                <TableCell>{this.state.jvmState.totalStartedThreadCount}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>PEAK THREAD COUNT</TableCell>
                                <TableCell>{this.state.jvmState.peakThreadCount}</TableCell>
                            </TableRow>
                        </Table>
                    </TableContainer>
                </Container>
            </div>
        );
    }
}

export const AdminForm = connect((state) => ({
    breadcrumbs: state.menuReducer.breadcrumbs,
    useDarkTheme: state.listReducer.useDarkTheme
}), (dispatch) => ({
    getBreadcrumbs: bindActionCreators(MenuActions.getBreadcrumbs, dispatch)
}), null, {withRef: true})(AdminFormInner);