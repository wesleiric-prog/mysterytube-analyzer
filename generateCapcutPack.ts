import fs from "fs";
import path from "path";

const output = "./output";
const capcut = "./output/capcut-pack";

if (!fs.existsSync(capcut)) fs.mkdirSync(capcut, { recursive: true });

fs.copyFileSync(`${output}/script.txt`, `${capcut}/roteiro.txt`);
fs.copyFileSync(`${output}/audio.mp3`, `${capcut}/narracao.mp3`);

fs.writeFileSync(`${capcut}/instrucoes_capcut.txt`, `
1. Importar narracao.mp3 no CapCut
2. Colocar imagens/vídeos de fundo
3. Cortar cenas a cada 5-8 segundos
4. Adicionar zoom lento
5. Adicionar legenda automática
6. Usar trilha sombria baixa
7. Exportar em 1080p
`);

fs.writeFileSync(`${capcut}/prompts_imagens.txt`, `
Gerar imagens cinematográficas sombrias baseadas no roteiro.
Estilo: terror documental, realista, escuro, suspense, 16:9.
`);

console.log("✅ Pacote CapCut criado em output/capcut-pack");