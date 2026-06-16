import fs from "fs";

const output = "./output";
const capcut = "./output/capcut-pack";

fs.mkdirSync(capcut, { recursive: true });

fs.copyFileSync(`${output}/script.txt`, `${capcut}/roteiro.txt`);
fs.copyFileSync(`${output}/audio.mp3`, `${capcut}/narracao.mp3`);

fs.writeFileSync(`${capcut}/instrucoes_capcut.txt`, `
1. Importar narracao.mp3
2. Importar imagens/vídeos
3. Adicionar legendas automáticas
4. Cortes a cada 5-8 segundos
5. Zoom lento nas imagens
6. Música sombria baixa
7. Exportar em 1080p
`);

fs.writeFileSync(`${capcut}/prompts_imagens.txt`, `
Estilo: terror documental, realista, sombrio, cinematográfico, 16:9.
Use o roteiro.txt como base para gerar cenas visuais.
`);

console.log("✅ Pacote CapCut criado em output/capcut-pack");