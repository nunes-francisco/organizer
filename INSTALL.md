# 📦 Installer Internal Files

Abaixo estão **todos os arquivos internos** necessários para gerar o instalador `.pkg` completo do Organizer para macOS.

Eles estão organizados na estrutura final que você deve ter em seu projeto:

```
organizer/
│
├── organizer.js
├── .env
├── logs.txt
│
└── pkg/
    ├── payload/
    │   ├── organizer.js
    │   └── .env
    │
    ├── scripts/
    │   ├── preinstall
    │   └── postinstall
    │
    └── org.organizer.plist
```

---

# 📁 1. `pkg/scripts/preinstall`

```bash
#!/bin/bash
# Ensure the target directory exists
mkdir -p /usr/local/organizer
exit 0
```

---

# 📁 2. `pkg/scripts/postinstall`

```bash
#!/bin/bash
# Copy payload files into place
cp -R "$2"/payload/* /usr/local/organizer/

# Install LaunchDaemon
cp "$2"/org.organizer.plist /Library/LaunchDaemons/
chmod 644 /Library/LaunchDaemons/org.organizer.plist

# Load the daemon
launchctl load /Library/LaunchDaemons/org.organizer.plist

exit 0
```

---

# 📁 3. `pkg/org.organizer.plist`

```xml
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

---

# 📁 4. `pkg/payload/organizer.js`

> **Observação:** uma cópia idêntica do seu script principal deve ser colocada aqui.

*(Cole aqui o conteúdo real do seu organizer.js)*

---

# 📁 5. `pkg/payload/.env`

> Também precisa ser copiado exatamente igual ao seu `.env` original.

*(Cole aqui o conteúdo real do seu .env)*

---

# 📦 Comando para gerar o instalador

Depois de montar a estrutura acima, execute:

```bash
pkgbuild \
  --root pkg/payload \
  --scripts pkg/scripts \
  --identifier org.organizer \
  --version 1.0.0 \
  OrganizerInstaller.pkg
```



# 🗑️ Uninstaller Package – Internal Files

Este documento contém **todos os arquivos necessários** para gerar um instalador `.pkg` de desinstalação (**uninstall.pkg**) que remove completamente:

* O LaunchDaemon
* O diretório `/usr/local/organizer`
* Logs
* Arquivos de configuração

A estrutura final deve ser esta:

```
uninstaller/
│
└── pkg/
    ├── scripts/
    │   ├── preinstall
    │   └── postinstall
    │
    └── org.organizer.uninstall.plist
```

O uninstall **não usa payload**, pois não instala arquivos — ele apenas executa scripts.

---

# 📄 1. `pkg/scripts/preinstall`

```bash
#!/bin/bash
# Nothing required here for uninstall
exit 0
```

---

# 📄 2. `pkg/scripts/postinstall`

```bash
#!/bin/bash

# Path definitions
TARGET_DIR="/usr/local/organizer"
PLIST_FILE="/Library/LaunchDaemons/org.organizer.plist"

# Stop daemon if loaded
if launchctl list | grep -q "org.organizer"; then
    echo "Stopping LaunchDaemon..."
    launchctl unload "$PLIST_FILE" 2>/dev/null
fi

# Remove plist
if [ -f "$PLIST_FILE" ]; then
    echo "Removing LaunchDaemon plist..."
    rm -f "$PLIST_FILE"
fi

# Remove main directory
if [ -d "$TARGET_DIR" ]; then
    echo "Removing organizer directory..."
    rm -rf "$TARGET_DIR"
fi

# Success message
echo "Organizer successfully uninstalled."

exit 0
```

---

# 📄 3. `pkg/org.organizer.uninstall.plist`

> Este arquivo é apenas informativo e não carregado pelo sistema; incluímos para manter consistência e metadados caso deseje embutir no `.pkg`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>org.organizer.uninstaller</string>
</dict>
</plist>
```

---

# 📦 Comando para gerar o `uninstall.pkg`

Execute dentro da pasta `uninstaller/`:

```bash
pkgbuild \
  --scripts pkg/scripts \
  --identifier org.organizer.uninstaller \
  --version 1.0.0 \
  UninstallOrganizer.pkg
```

Isso criará:

```
UninstallOrganizer.pkg
```

Um pacote que remove automaticamente tudo relacionado ao Organizer.

---

# ✔ O que o Uninstall faz

* Finaliza o LaunchDaemon
* Remove o arquivo plist
* Remove `/usr/local/organizer/`
* Remove logs e configurações
* Não deixa nenhum resquício

---

Se quiser, posso gerar também:

✅ um **script completo `build_uninstall.sh`** (gera o pkg automaticamente)

ou

✅ um **ZIP baixável** com toda a estrutura pronta para compilar

ou

✅ gerar o `.pkg` final diretamente para download.

## Uninstaller (uninstall.pkg)

Este projeto inclui também um **pacote de desinstalação (uninstall.pkg)** capaz de remover automaticamente:

* O LaunchDaemon criado (`com.francisco.filewatcher.plist`)
* O script principal do watcher
* A pasta com scripts auxiliares
* Todos os arquivos instalados em `/Library/FileWatcherAutomation/`

### Estrutura interna do uninstaller

```
uninstall_pkg/
│
├── Scripts/
│   └── postinstall       # Remove arquivos e desativa o daemon
│
└── Distribution.xml       # Define o pacote de desinstalação
```

### O que o uninstaller faz

* Para e remove o LaunchDaemon do macOS
* Exclui o arquivo `.plist`
* Remove todas as pastas instaladas em `/Library/FileWatcherAutomation`
* Garante que nenhum resíduo permaneça

### Comando para gerar o uninstall.pkg

Caso queira gerar manualmente:

```bash
pkgbuild \
  --identifier com.francisco.filewatcher.uninstaller \
  --nopayload \
  --scripts uninstall_pkg/Scripts \
  uninstall.pkg
```

### Como usar

Basta executar o `uninstall.pkg`. Ele pedirá permissão administrativa e após a conclusão todo o serviço será removido.
