// Renderiza uma cena em MP4, quadro a quadro.
// Uso: node render.js como-nasce-uma-lei [--fps 30] [--audio narracao.mp3] [--saida out/video.mp4] [--quadro 6.5]
// O primeiro argumento é o nome de uma pasta em site/videos/cenas/ (ou um caminho para uma pasta de cena).
// --quadro só tira um PNG naquele segundo (útil para conferir uma pose).
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const opcao = (nome, padrao) => { const i = args.indexOf("--" + nome); return i >= 0 ? args[i + 1] : padrao; };
const arg = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!arg) { console.error("Informe a cena, ex.: node render.js como-nasce-uma-lei"); process.exit(1); }
const cena = fs.existsSync(path.join(arg, "index.html")) ? arg : path.join(__dirname, "..", "site", "videos", "cenas", arg);
if (!fs.existsSync(path.join(cena, "index.html"))) { console.error("Cena não encontrada:", cena); process.exit(1); }

const fps = +opcao("fps", 30);
const audio = opcao("audio");
const quadro = opcao("quadro");
const nome = path.basename(path.resolve(cena));
const saida = opcao("saida", path.join(__dirname, "out", quadro ? `${nome}-${quadro}s.png` : `${nome}.mp4`));
fs.mkdirSync(path.dirname(saida), { recursive: true });

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const url = "file://" + path.resolve(cena, "index.html") + "?render=1";
  await pagina.goto(url);
  await pagina.waitForFunction(() => window.CENA_PRONTA === true);
  await pagina.evaluate(() => document.fonts.ready);
  const palco = pagina.locator(".palco");

  if (quadro) {
    await pagina.evaluate((t) => window.seek(t), +quadro);
    await palco.screenshot({ path: saida });
    console.log("Quadro salvo em", saida);
    return navegador.close();
  }

  const duracao = await pagina.evaluate(() => window.DURACAO);
  const total = Math.round(duracao * fps);
  const ff = ["-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-"];
  if (audio) ff.push("-i", audio, "-c:a", "aac", "-b:a", "192k", "-shortest");
  ff.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", saida);
  const ffmpeg = spawn("ffmpeg", ff, { stdio: ["pipe", "ignore", "inherit"] });

  for (let i = 0; i < total; i++) {
    await pagina.evaluate((t) => window.seek(t), i / fps);
    const png = await palco.screenshot({ type: "png" });
    if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
    if (i % fps === 0) process.stdout.write(`\r${Math.round((i / total) * 100)}%`);
  }
  ffmpeg.stdin.end();
  await new Promise((r) => ffmpeg.on("close", r));
  await navegador.close();
  console.log(`\rVídeo salvo em ${saida} (${duracao}s, ${fps} fps)`);
})();
