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
