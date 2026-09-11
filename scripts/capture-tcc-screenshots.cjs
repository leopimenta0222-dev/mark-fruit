const fs = require("node:fs");
const path = require("node:path");

const playwrightModule = process.env.MARKFRUIT_PLAYWRIGHT_MODULE;
const demoPassword = process.env.MARKFRUIT_DEMO_PASSWORD;
const baseUrl = process.env.MARKFRUIT_BASE_URL || "http://127.0.0.1:5173";

if (!playwrightModule) throw new Error("Defina MARKFRUIT_PLAYWRIGHT_MODULE com o caminho do Playwright.");
if (!demoPassword) throw new Error("Defina MARKFRUIT_DEMO_PASSWORD sem gravar a senha no repositório.");

const { chromium } = require(playwrightModule);
const outputDir = path.resolve(__dirname, "../docs/tcc/prints");
fs.mkdirSync(outputDir, { recursive: true });

async function preparePage(context) {
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.setItem("markfruit:theme", "light"));
  return page;
}

async function settle(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(850);
}

async function capture(page, filename, pathname, loadingText = "") {
  if (pathname) await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded" });
  await settle(page);
  if (loadingText) {
    await page.getByText(loadingText, { exact: true }).waitFor({ state: "hidden", timeout: 15000 });
  }
  await page.screenshot({ path: path.join(outputDir, filename), fullPage: false });
}

async function login(page, email) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(demoPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => !url.pathname.endsWith("/login"));
  await settle(page);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true,
  });
  const viewport = { width: 1024, height: 768 };

  try {
    const publicContext = await browser.newContext({ viewport, colorScheme: "light", locale: "pt-BR" });
    const publicPage = await preparePage(publicContext);
    await capture(publicPage, "01-home.png", "/");
    await capture(publicPage, "02-busca.png", "/?q=morango");
    await capture(publicPage, "03-login.png", "/login");
    await capture(publicPage, "04-cadastro.png", "/cadastro");
    await capture(publicPage, "05-produto.png", "/post/4");
    await capture(publicPage, "06-como-plantar.png", "/como-plantar");
    await capture(publicPage, "07-carrinho-vazio.png", "/carrinho");
    await publicContext.close();

    const consumerContext = await browser.newContext({ viewport, colorScheme: "light", locale: "pt-BR" });
    const consumerPage = await preparePage(consumerContext);
    await login(consumerPage, "ana@markfruit.com");
    await capture(consumerPage, "08-perfil-consumidor.png", "/perfil");
    await consumerPage.goto(`${baseUrl}/post/4`, { waitUntil: "domcontentloaded" });
    await settle(consumerPage);
    await consumerPage.getByRole("button", { name: "Adicionar ao carrinho" }).click();
    await capture(consumerPage, "09-carrinho-preenchido.png", "/carrinho");
    await capture(consumerPage, "10-checkout-retirada.png", "/checkout");
    await consumerPage.locator('input[name="fulfillment"][value="DELIVERY"]').check({ force: true });
    await settle(consumerPage);
    await consumerPage.screenshot({ path: path.join(outputDir, "11-checkout-entrega.png"), fullPage: false });
    await consumerPage.evaluate(() => history.replaceState({ usr: { orderIds: [4, 5] }, key: "tcc-demo", idx: 0 }, "", "/pedido-confirmado"));
    await consumerPage.reload({ waitUntil: "domcontentloaded" });
    await settle(consumerPage);
    await consumerPage.screenshot({ path: path.join(outputDir, "12-confirmacao.png"), fullPage: false });
    await capture(consumerPage, "13-pedidos-consumidor.png", "/pedidos", "Carregando pedidos...");
    await capture(consumerPage, "14-detalhe-pedido.png", "/pedidos/4", "Carregando pedido...");
    await capture(consumerPage, "15-conversas.png", "/chats", "Carregando...");
    await consumerPage.goto(`${baseUrl}/post/4`, { waitUntil: "domcontentloaded" });
    await settle(consumerPage);
    await consumerPage.getByRole("button", { name: "Conversar com o produtor" }).click();
    await consumerPage.waitForURL(/\/chat\//);
    await consumerPage.getByPlaceholder("Digite uma mensagem...").waitFor({ state: "visible", timeout: 15000 });
    await consumerPage.screenshot({ path: path.join(outputDir, "16-chat.png"), fullPage: false });
    await consumerContext.close();

    const producerContext = await browser.newContext({ viewport, colorScheme: "light", locale: "pt-BR" });
    const producerPage = await preparePage(producerContext);
    await login(producerPage, "joaquim@markfruit.com");
    await capture(producerPage, "17-perfil-produtor.png", "/perfil");
    await capture(producerPage, "18-novo-anuncio.png", "/posts/novo");
    await capture(producerPage, "19-pedidos-recebidos.png", "/pedidos-recebidos", "Carregando pedidos...");
    await capture(producerPage, "20-pagina-nao-encontrada.png", "/pagina-inexistente");
    await producerContext.close();
  } finally {
    await browser.close();
  }

  console.log(`Capturas salvas em ${outputDir}`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
