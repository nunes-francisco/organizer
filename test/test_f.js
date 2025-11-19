function run(input, parameters) {
    // Importa as aplicações necessárias para manipulação do sistema de arquivos e notificações
    let app = Application.currentApplication();
    app.includeStandardAdditions = true;
    let Finder = Application("Finder");

    // 'input' é um array de caminhos POSIX dos novos itens
    for (let i = 0; i < input.length; i++) {
        let originalPath = input[i].toString();
        let fileName = originalPath.substring(originalPath.lastIndexOf('/') + 1);

        // Ignora pastas ou itens ocultos (opcional)
        if (fileName.startsWith('.')) {
            continue;
        }

        // Obtém a extensão do arquivo (ex: "pdf", "jpg")
        let extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        
        // Define o nome da subpasta (ex: "pdf_files")
        let folderName = extension + "_files";
        
        // Define o caminho completo da pasta de destino. 
        // Usaremos o diretório PA pai do arquivo original como base.
        let parentDir = originalPath.substring(0, originalPath.lastIndexOf('/'));
        let destinationPath = parentDir + "/" + folderName;

        // --- Lógica para criar a pasta se não existir ---
        let destFolder = Path(destinationPath);
        try {
            // Tenta acessar a pasta. Se falhar, ela não existe.
            Finder.folders.byName(folderName);
        } catch (e) {
            // Se a pasta não existe, cria ela usando o Finder
            Finder.make({
                new: "folder",
                at: Path(parentDir),
                withProperties: { name: folderName }
            });
        }
        
        // --- Lógica para mover o arquivo ---
        try {
            let fileToMove = Path(originalPath);
            let folderDest = Path(destinationPath);

            // Move o item para a nova pasta usando o Finder
            Finder.move(fileToMove, { to: folderDest });
            
            // Exibe notificação de sucesso
            app.displayNotification(fileName, {
                withTitle: "Arquivo Organizado Automaticamente",
                subtitle: "Movido para a pasta: " + folderName,
                soundName: "Pop"
            });

        } catch (e) {
            // Lida com erros de movimentação (ex: arquivo já existe no destino)
            app.displayNotification("Erro ao mover: " + fileName, {
                withTitle: "Erro de Organização",
                subtitle: "Motivo: " + e.message
            });
        }
    }
    
    return input;
}
