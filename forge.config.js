const os = require("os")
const arch = os.arch()
module.exports = {
    packagerConfig: {
        icon: __dirname + "/assets/icon"
    },
    rebuildConfig: {},
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                authors: "Nikita Schneider",
                description: "Addressbook Desktop",
                iconUrl: __dirname + "/assets/icon.ico",
                setupIcon: __dirname + "/assets/icon.ico",
                setupExe: "Addressbook-${version}-setup-x86-64.exe"
            },
        },
        {
            name: "@electron-forge/maker-dmg",
            config: {
                additionalDMGOptions: {
                    window: {
                        size: {
                            height: 420,
                            width: 516
                        }
                    }
                },
                format: "ULFO",
                icon: __dirname + "/assets/icon.icns",
                overwrite: true,
                background: __dirname + "/assets/background.png",
                contents: [
                    {"x": 400, "y": 240, "type": "link", "path": "/Applications"},
                    {
                        "x": 120,
                        "y": 240,
                        "type": "file",
                        "path": __dirname + "/out/Addressbook Desktop-darwin-" + arch + "/Addressbook Desktop.app"
                    }
                ]
            }
        }
    ],
    plugins: [
        {
            name: "@electron-forge/plugin-webpack",
            config: {
                devContentSecurityPolicy: "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;",
                mainConfig: "./webpack.main.config.js",
                renderer: {
                    config: "./webpack.renderer.config.js",
                    entryPoints: [
                        {
                            html: "./src/index.html",
                            hash: "login",
                            js: "./src/renderer.js",
                            name: "main_window",
                            preload: {
                                js: "./src/preload.js",
                            },
                        },
                    ],
                },
                port: 3001,
                loggerPort: 9001
            },
        },
    ],
};
