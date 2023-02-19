module.exports = {
    packagerConfig: {
        icon: __dirname + '/assets/icon'
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                authors: 'Nikita Schneider',
                description: 'Addressbook Desktop',
                iconUrl: __dirname + '/assets/favicon.ico',
                setupIcon: __dirname + '/assets/icon.ico',
                setupExe: 'Addressbook-${version}-setup-x86-64.exe'
            },
        },
        {
            name: '@electron-forge/maker-dmg',
            config: {
                format: 'ULFO',
                icon: __dirname + '/assets/icon.icns'
            }
        }
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-webpack',
            config: {
                devContentSecurityPolicy: "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;",
                mainConfig: './webpack.main.config.js',
                renderer: {
                    config: './webpack.renderer.config.js',
                    entryPoints: [
                        {
                            html: './src/index.html',
                            hash: 'login',
                            js: './src/renderer.js',
                            name: 'main_window',
                            preload: {
                                js: './src/preload.js',
                            },
                        },
                    ],
                },
            },
        },
    ],
};
