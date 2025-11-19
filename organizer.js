#!/usr/bin/env node

/**
 * Organizador Automático de Arquivos para macOS
 * Usa Node.js + Notificação nativa + Log + Lock file
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
require("dotenv").config();

// ------------- CONFIGURAÇÕES -------------
const WATCH_DIR = process.env.WATCH_DIR;
const LOG_ENABLED = process.env.LOG_ENABLED === "true";
const SEND_NOTIFICATION = process.env.NOTIFY === "true";

// ------------- MAPA DE EXTENSÕES -------------
const fileMap = {
    ".md": "markdown_files",
    ".js": "js_files",
    ".txt": "text_files",
    ".json": "json_files",
    ".pdf": "pdf_files",
    ".png": "image_files",
    ".jpg": "image_files",
    ".jpeg": "image_files",
    ".gif": "image_files",
    ".mp4": "video_files",
    ".mov": "video_files",
    ".avi": "video_files",
    ".mp3": "audio_files",
    ".wav": "audio_files",
    ".ogg": "audio_files",
    ".flac": "audio_files",
    ".exe": "executable_files",
    ".dmg": "executable_files",
    ".zip": "compressed_files",
    ".rar": "compressed_files",
    ".7z": "compressed_files",
    ".tar.gz": "compressed_files",
    ".tar.xz": "compressed_files",
    ".tar.bz2": "compressed_files",
    ".tar": "compressed_files",
    ".gz": "compressed_files",
    ".xz": "compressed_files",
    ".bz2": "compressed_files",
    ".doc": "word_files",
    ".docx": "word_files",
    ".xls": "spreadsheet_files",
    ".xlsx": "spreadsheet_files",
    ".csv": "spreadsheet_files",
    ".ppt": "presentation_files",
    ".pptx": "presentation_files",
    ".odt": "spreadsheet_files",
    ".ods": "spreadsheet_files",
    ".odp": "presentation_files",
    ".py": "python_files",
    ".go": "go_files",
    ".ts": "typescript_files",
    ".tsx": "typescript_files",
    "jsx": "js_files",
    "ipynb": "notebook_files",
    ".java": "java_files",
    ".c": "c_files",
    ".cpp": "cpp_files",
    ".rb": "ruby_files",
    ".php": "php_files",
    ".html": "web_files",
    ".css": "web_files",
    ".xml": "xml_files",
    ".yml": "yaml_files",
    ".yaml": "yaml_files",
    ".ini": "config_files",
    ".log": "log_files",
    ".svg": "image_files",
    ".gif": "image_files",
    ".png": "image_files",
    ".jpg": "image_files",
    ".jpeg": "image_files",
    ".ico": "image_files",
    ".bmp": "image_files",
    ".webm": "video_files",
    ".mkv": "video_files",
    ".lv": "video_files",
    ".wmv": "video_files",
    ".aac": "audio_files",
    ".m4a": "audio_files",
    ".wma": "audio_files",
    ".weba": "audio_files",
    ".sh": "script_files",
    ".bat": "script_files",
    ".sql": "database_files",
    ".db": "database_files",
    ".sqlite": "database_files",
    ".pkg": "executable_files",
    ".rpm": "executable_files",
    ".deb": "executable_files",
    ".duck": "compressed_files",
    ".dump": "database_files",
    ".webp": "image_files",
    ".epub": "compressed_files",
    ".jsx": "js_files",
};

// ------------- FUNÇÕES AUXILIARES -------------

function log(msg) {
    if (!LOG_ENABLED) return;
    fs.appendFileSync("logs.txt", `[${new Date().toISOString()}] ${msg}\n`);
}

function notify(title, message) {
    if (!SEND_NOTIFICATION) return;

    // Notificação nativa do macOS via AppleScript
    const cmd = `osascript -e 'display notification "${message}" with title "${title}"'`;
    execSync(cmd);
}

function createLock() {
    if (fs.existsSync(".lock")) {
        log("Processo ignorado (lock ativo).");
        process.exit(0);
    }
    fs.writeFileSync(".lock", "");
}

function removeLock() {
    if (fs.existsSync(".lock")) {
        fs.unlinkSync(".lock");
    }
}

process.on("exit", removeLock);
process.on("SIGINT", removeLock);
process.on("SIGTERM", removeLock);

// ------------- INÍCIO DO SCRIPT -------------

(async () => {
    createLock();

    log("Iniciando execução...");
    notify("Organizador", "Processo iniciado…");

    const files = await fs.promises.readdir(WATCH_DIR);

    for (const file of files) {
        const fullPath = path.join(WATCH_DIR, file);

        const stats = await fs.promises.lstat(fullPath);

        // Ignora pastas
        if (stats.isDirectory()) continue;

        // Detecta extensão
        const ext = path.extname(file).toLowerCase();

        // Se a extensão não tem destino mapeado → ignora
        const targetFolder = fileMap[ext];
        if (!targetFolder) continue;

        const destFolder = path.join(WATCH_DIR, targetFolder);
        const destPath = path.join(destFolder, file);

        // Cria pasta se não existir
        await fs.promises.mkdir(destFolder, { recursive: true });

        // Move arquivo
        await fs.promises.rename(fullPath, destPath);

        log(`Movido: ${file} → ${targetFolder}`);
    }

    notify("Organizador", "Arquivos organizados com sucesso!");
    log("Execução concluída.");
})();
