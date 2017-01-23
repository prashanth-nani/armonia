# Armonia

**A Cross platform music player.**
Built upon github's electron.

_Note:  This product is currently under development_

===

### Implemented

- Songs Section
- Play Button
- Album Art
- Progress bar

===

### To be implemented

- Playlists
- Other controls (Previous, next, repeat, shuffle)
- Settings
- Auto detect new music files on app restart
- Search
- Remaining sections on the sidebar
- Control with Music keys
- Themes
- Music tag editing
- Equalizer

===

### Installation

Releases can be found [here](https://github.com/prashanth-nani/armonia/releases). Please note that these are only portable versions. Installers will be provided once the remaining features are implemented.

===

### Troubleshooting

Armonia is currently in development. This implies some things can break after an update (database schemes changes, config...).

If you encounter freezes when starting the app, you can reset Armonia by following these steps:

- Go to the Armonia folder directory
    - Windows: `%AppData%\Armonia`
    - OSX: `~/Library/Application Support/Armonia`
    - Linux: `~/.config/Armonia/` or `$XDG_CONFIG_HOME/Armonia`
- Delete:
    - `Armonia.db` file
    - `user-prefs.json` file
    - `resources` folder
- Restart Armonia

If you still get problems after that, please open an issue :)

===

### Screenshots

![Songs view](./Screenshot1.png)

![Songs view](./Screenshot2.png)

_Note_: UI is inspired from Windows Groove music

===

### Development
#### How to run
- Install git
- Clone repository
- Install node >= 7.2.1
- Install npm >= 3.10.10
- Run the following commands
```bash
cd armonia
npm install
npm run compile
npm start
```

===

### Packaging
Packaging for linux 64 bit:
- Run
```bash
npm install electron-packager -g
cd armonia
electron-packager . --arch=x64 --platform=linux --prune --overwrite
```

===
