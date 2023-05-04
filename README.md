# [Addressbook](https://github.com/dredwardhyde/addressbook) Desktop Application (macOS & Windows)

### Features

- **[Dark/Light Theme support](https://github.com/dredwardhyde/addressbook-desktop-app/blob/master/src/Common/App.js#L14)** 
- **Building [Windows](https://github.com/dredwardhyde/addressbook-desktop-app/blob/master/forge.config.js#L10) and [macOS for x86/AArch64](https://github.com/dredwardhyde/addressbook-desktop-app/blob/master/forge.config.js#L20)(DMG with [custom layout](https://github.com/dredwardhyde/addressbook-desktop-app/blob/master/forge.config.js#L34)) installers using Electron Forge**
- **Communication between ipcMain and ipcRenderer modules using [ContextBridge](https://github.com/dredwardhyde/addressbook-desktop-app/blob/master/src/preload.js#L13)**
- **[File downloading](https://github.com/dredwardhyde/addressbook-desktop-app/blob/master/src/main.js#L17)**
- **[Custom title bar](https://github.com/dredwardhyde/addressbook-desktop-app/blob/master/src/preload.js#L39)**
- **[Custom splash screen](https://github.com/dredwardhyde/addressbook-desktop-app/blob/master/src/main.js#L43)**

### Building on target platform
```sh
npm install --force
npm run make
```
### Windows
#### Binary
<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/windows_binary.png" width="765"/>  

#### Signature
<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/windows_signature.png" width="437"/>  

#### Control panel
<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/windows_installed_control_panel.png" width="1000"/>  

#### Start Menu
<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/windows_installed_programs.png" width="298"/>  

#### Desktop Shortcut
<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/windows_installed_shortcut.png" width="476"/>  


#### Application Window
<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/windows_installed_app_light.png" width="1000"/>  

<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/windows_installed_app_dark.png" width="1000"/>  

### macOS
#### Binary
<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/macos_binary.png" width="1000"/>  

#### DMG
<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/macos_dmg.png" width="600"/>  

#### Applications Folder
<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/macos_apps.png" width="1000"/>  

#### App Icon
<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/macos_icon.png" width="500"/>  


#### Application Window
<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/macos_installed_app_light.png" width="1000"/>  

<img src="https://raw.githubusercontent.com/dredwardhyde/addressbook-desktop-app/master/readme/macos_installed_app_dark.png" width="1000"/>  
