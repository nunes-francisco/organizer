![Install](https://img.shields.io/badge/Install-.pkg-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-0.1.0-orange?style=for-the-badge)

# FileWatcher Automation

Pequeno projeto em JavaScript, com propósito de organizar arquivos automaticamente no macOS.

![](/Users/francisconunes/Projects/organizer/organizer/assets/capa.png)


# 📦 Organizer for macOS – Automatic File Sorting

A powerful, automated file‑organizing system for macOS. This tool monitors a folder and automatically moves incoming files into categorized subfolders based on file extensions.

Designed for:

* ✔ Automatic background execution
* ✔ macOS LaunchDaemon service (installed via `.pkg`)
* ✔ Node.js processing
* ✔ Logs + Notifications
* ✔ Customizable rules via `.env`

---

# 🚀 Features

* **Automatic execution** whenever new files appear in the watched folder
* **Installed as a macOS LaunchDaemon** (no Automator required)
* **Category‑based sorting** using a configurable extension map
* **macOS native notifications** via AppleScript
* **Lock file** (prevents multiple processes running at once)
* **Logging to `logs.txt`**
* **Easy configuration with `.env`**
* Works fully in background

---

# 📁 Project Structure

```
organizer/
│
├── organizer.js          # Main sorting script
├── .env                  # Configuration
├── logs.txt              # Log file
├── pkg/                  # Files used to build installer
│   ├── scripts/
│   │   ├── postinstall
│   │   └── preinstall
│   ├── payload/
│   │   ├── organizer.js
│   │   └── .env
│   └── org.organizer.plist
└── README.md
```

---

# 🔧 Requirements

* macOS 10.13 or higher
* Node.js 16+
* Xcode Command Line Tools (for pkgbuild)

Install CLT if needed:

```bash
xcode-select --install
```

---

# ⚙️ Configuration (`.env`)

```
WATCH_DIR=/Users/your_user/Downloads
LOG_ENABLED=true
NOTIFY=true
```

| Variable        | Description              |
| --------------- | ------------------------ |
| `WATCH_DIR`   | Folder to monitor        |
| `LOG_ENABLED` | Enable/disable logs      |
| `NOTIFY`      | Show macOS notifications |

---

# 🧠 How It Works

1. A LaunchDaemon is installed in:

```
/Library/LaunchDaemons/org.organizer.plist
```

2. macOS keeps the daemon always running.
3. Every time files appear in `WATCH_DIR`, the script:

   * Reads them
   * Checks extensions
   * Creates destination folders
   * Moves them
   * Logs and notifies

---

# 📦 Installing via `.pkg`

After generating the installer (instructions in next section), install it normally:

1. Double‑click: `OrganizerInstaller.pkg`
2. macOS will:

   * Copy files into `/usr/local/organizer/`
   * Create LaunchDaemon
   * Start the background service

To verify:

```bash
launchctl list | grep organizer
```

To start manually:

```bash
sudo launchctl load /Library/LaunchDaemons/org.organizer.plist
```

To stop:

```bash
sudo launchctl unload /Library/LaunchDaemons/org.organizer.plist
```

---

# 🏗 Building the `.pkg` Installer

## 1. Create payload folder

```
mkdir -p pkg/payload
cp organizer.js pkg/payload/
cp .env pkg/payload/
```

## 2. Create preinstall script

`pkg/scripts/preinstall`:

```
#!/bin/bash
# Ensure directory exists
mkdir -p /usr/local/organizer
exit 0
```

Make executable:

```
chmod +x pkg/scripts/preinstall
```

## 3. Create postinstall script

`pkg/scripts/postinstall`:

```
#!/bin/bash
cp -R "$2"/payload/* /usr/local/organizer/
cp "$2"/org.organizer.plist /Library/LaunchDaemons/
chmod 644 /Library/LaunchDaemons/org.organizer.plist
launchctl load /Library/LaunchDaemons/org.organizer.plist
exit 0
```

Make executable:

```
chmod +x pkg/scripts/postinstall
```

## 4. Create LaunchDaemon plist

`pkg/org.organizer.plist`:

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>org.organizer</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/usr/local/organizer/organizer.js</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

## 5. Build the installer

```
pkgbuild \
  --root pkg/payload \
  --scripts pkg/scripts \
  --identifier org.organizer \
  --version 1.0.0 \
  OrganizerInstaller.pkg
```

A file named **`OrganizerInstaller.pkg`** will be generated.

---

# 🧹 Uninstalling

Stop daemon:

```bash
sudo launchctl unload /Library/LaunchDaemons/org.organizer.plist
```

Remove files:

```bash
sudo rm -rf /usr/local/organizer
sudo rm /Library/LaunchDaemons/org.organizer.plist
```

---

# 🐛 Debugging

Check logs:

```
tail -f /usr/local/organizer/logs.txt
```

Check daemon status:

```
sudo launchctl list | grep organizer
```

---

# 📜 License

MIT License. Feel free to use and modify.

---

# 💬 Support

If you need:

* a version with GUI
* custom notification center integration
* iCloud synchronization
* Homebrew formula

Just open an issue or ask!
