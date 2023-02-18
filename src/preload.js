// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

const ipc = {
    'render': {
        'send': ['get-server-url', 'save-server-url'],
        'receive': ['server-url'],
        'sendReceive': []
    }
};

contextBridge.exposeInMainWorld(
    'ipcRenderer', {
        send: (channel, args) => {
            let validChannels = ipc.render.send;
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, args);
            }
        },
        receive: (channel, listener) => {
            let validChannels = ipc.render.receive;
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => listener(...args));
            }
        },
        invoke: (channel, args) => {
            let validChannels = ipc.render.sendReceive;
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, args);
            }
        }
    }
);