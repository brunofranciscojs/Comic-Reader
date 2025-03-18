const fs = require("fs");
const unrar = require("unrar");

const extractCbr = (filePath, outputDir) => {
  const rar = new unrar(filePath);
  rar.extract(outputDir);
};

// Exemplo de uso
extractCbr("arquivo.cbr", "pasta_destino");