import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo supabase/.env");
  process.exit(1);
}

// Cliente admin (service_role) — ignora RLS, pode criar usuários.
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const img = (file) => `/products/${file}`;

const PRODUCERS = [
  { email: "joaquim@markfruit.com", name: "Sítio do Joaquim", city: "Mogi das Cruzes", state: "SP", bio: "Produzo orgânicos há 20 anos no sítio da família.", latitude: -23.5235, longitude: -46.1857 },
  { email: "maria@markfruit.com", name: "Horta da Maria", city: "Campinas", state: "SP", bio: "Hortaliças frescas direto da horta.", latitude: -22.9099, longitude: -47.0626 },
  { email: "valeverde@markfruit.com", name: "Fazenda Vale Verde", city: "Atibaia", state: "SP", bio: "Produção sustentável de frutas tropicais e cítricas.", latitude: -23.1170, longitude: -46.5503 },
  { email: "luiz@markfruit.com", name: "Pomar do Luiz", city: "Petrópolis", state: "RJ", bio: "Pomar familiar com frutas da serra.", latitude: -22.5050, longitude: -43.1786 },
  { email: "bemestar@markfruit.com", name: "Chácara Bem Estar", city: "Embu das Artes", state: "SP", bio: "Verduras hidropônicas e ervas aromáticas.", latitude: -23.6489, longitude: -46.8525 },
  { email: "sementes@markfruit.com", name: "Sítio Sementes do Bem", city: "Holambra", state: "SP", bio: "Especializados em sementes crioulas e mudas.", latitude: -22.6346, longitude: -47.0567 },
];

const CONSUMERS = [
  { email: "ana@markfruit.com", name: "Ana Consumidora", city: "São Paulo", state: "SP", latitude: -23.5505, longitude: -46.6333 },
  { email: "pedro@markfruit.com", name: "Pedro Cliente", city: "Rio de Janeiro", state: "RJ", latitude: -22.9068, longitude: -43.1729 },
];

const PRODUCTS = [
  // FRUTAS
  { title: "Tomate orgânico 1kg", description: "Tomates colhidos hoje, sem agrotóxicos, super saborosos.", price: 12.5, category: "Frutas", image: img("tomate.png"), stock: 50 },
  { title: "Banana prata 1kg", description: "Banana prata madura no ponto, doce e firme.", price: 6.9, category: "Frutas", image: img("banana.png"), stock: 100 },
  { title: "Maçã gala vermelha 1kg", description: "Maçãs crocantes, doces, perfeitas pra lancheira.", price: 9.9, category: "Frutas", image: img("maca.png"), stock: 60 },
  { title: "Morango orgânico 500g", description: "Morangos suculentos colhidos esta semana.", price: 18.0, category: "Frutas", image: img("morango.png"), stock: 25 },
  { title: "Laranja pera 3kg", description: "Saco com laranjas da nossa fazenda. Doces e cheias de suco.", price: 19.9, category: "Frutas", image: img("laranja.png"), stock: 40 },
  { title: "Mamão papaya unidade", description: "Mamão grande, ponto certo pra comer já. Aprox 1.5kg.", price: 11.5, category: "Frutas", image: img("mamao.png"), stock: 30 },
  { title: "Abacaxi pérola unidade", description: "Abacaxi pérola super doce, direto da fazenda do norte.", price: 9.0, category: "Frutas", image: img("abacaxi.png"), stock: 20 },
  { title: "Manga palmer 1kg", description: "Manga palmer doce e sem fibras.", price: 14.9, category: "Frutas", image: img("manga.jpg"), stock: 35 },
  { title: "Uva itália 1kg", description: "Cacho de uva itália grande, sem semente.", price: 22.0, category: "Frutas", image: img("uva.jpg"), stock: 15 },
  { title: "Melancia inteira", description: "Melancia gigante, perfeita pra família toda. Aprox 8kg.", price: 28.0, category: "Frutas", image: img("melancia.jpg"), stock: 12 },
  { title: "Limão tahiti 1kg", description: "Limão tahiti suculento, ótimo pra suco e caipirinha.", price: 7.5, category: "Frutas", image: img("limao-tahiti.png"), stock: 80 },
  { title: "Pêssego amarelo 1kg", description: "Pêssegos da serra, doces e perfumados.", price: 16.9, category: "Frutas", image: img("pessego.png"), stock: 22 },
  { title: "Goiaba vermelha 1kg", description: "Goiabas vermelhas maduras, ideal pra suco ou doce.", price: 8.9, category: "Frutas", image: img("goiaba.jpg"), stock: 30 },
  { title: "Abacate hass 1kg", description: "Abacate hass cremoso, ponto perfeito pra guacamole.", price: 13.5, category: "Frutas", image: img("abacate.png"), stock: 40 },
  { title: "Coco verde unidade", description: "Coco geladinho, ideal pra água de coco natural.", price: 8.0, category: "Frutas", image: img("coco.jpg"), stock: 50 },
  { title: "Kiwi unidade", description: "Kiwi maduro, doce e azedinho.", price: 4.5, category: "Frutas", image: img("kiwi.png"), stock: 60 },
  // VERDURAS
  { title: "Alface crespa fresquinha", description: "Pé de alface grande, recém colhido. Ótima pra salada.", price: 4.0, category: "Verduras", image: img("alface.png"), stock: 60 },
  { title: "Cenoura orgânica 1kg", description: "Cenouras grandes, doces e plantadas em solo arenoso.", price: 7.5, category: "Verduras", image: img("cenoura.png"), stock: 40 },
  { title: "Cebola roxa 1kg", description: "Cebola roxa, perfeita pra saladas e molhos.", price: 9.9, category: "Verduras", image: img("cebola.png"), stock: 50 },
  { title: "Batata inglesa 2kg", description: "Batata inglesa lavada, pronta pra usar.", price: 13.5, category: "Verduras", image: img("batata.png"), stock: 45 },
  { title: "Brócolis maço", description: "Maço de brócolis ninja super fresquinho.", price: 8.5, category: "Verduras", image: img("brocolis.png"), stock: 25 },
  { title: "Couve manteiga maço", description: "Couve manteiga macia, ótima refogada.", price: 5.0, category: "Verduras", image: img("couve.png"), stock: 35 },
  { title: "Pimentão amarelo 1kg", description: "Pimentões amarelos crocantes e doces.", price: 14.9, category: "Verduras", image: img("pimentao.png"), stock: 28 },
  { title: "Pepino japonês 1kg", description: "Pepino japonês fresquinho, ótimo pra sushi e saladas.", price: 8.0, category: "Verduras", image: img("pepino.png"), stock: 32 },
  { title: "Abobrinha italiana 1kg", description: "Abobrinha italiana tenra, perfeita pra grelhar.", price: 7.9, category: "Verduras", image: img("abobrinha.png"), stock: 30 },
  { title: "Beterraba orgânica 1kg", description: "Beterraba bem doce, ótima crua ou cozida.", price: 6.5, category: "Verduras", image: img("beterraba.png"), stock: 38 },
  { title: "Rúcula maço", description: "Rúcula da horta hidropônica, fresquinha e picante.", price: 5.5, category: "Verduras", image: img("rucula.png"), stock: 30 },
  { title: "Espinafre maço", description: "Espinafre fresco, ótimo pra refogados e omeletes.", price: 6.0, category: "Verduras", image: img("espinafre.png"), stock: 25 },
  { title: "Tomate cereja 500g", description: "Tomate cereja docinho, bandeja com 500g.", price: 11.9, category: "Verduras", image: img("tomate-cereja.png"), stock: 40 },
  { title: "Milho verde 6 espigas", description: "Milho verde fresco, ideal pra cozinhar ou assar.", price: 15.0, category: "Verduras", image: img("milho.png"), stock: 20 },
  { title: "Pimenta dedo-de-moça 200g", description: "Pimenta vermelha brasileira, picância média.", price: 9.5, category: "Verduras", image: img("pimenta.png"), stock: 25 },
  // PLANTAS
  { title: "Muda de manjericão", description: "Muda de manjericão saudável em vaso de 12cm.", price: 12.0, category: "Plantas", image: img("manjericao.png"), stock: 50 },
  { title: "Muda de hortelã", description: "Muda de hortelã pronta pra transplantar.", price: 10.0, category: "Plantas", image: img("hortela.png"), stock: 45 },
  { title: "Muda de limoeiro siciliano", description: "Limoeiro siciliano enxertado, 60cm. Frutifica em 1 ano.", price: 65.0, category: "Plantas", image: img("limoeiro.png"), stock: 10 },
  { title: "Pé de morango", description: "Muda de morango variedade albion em vaso de 15cm.", price: 18.5, category: "Plantas", image: img("morango.png"), stock: 25 },
  { title: "Muda de salsinha", description: "Salsinha lisa em mini vaso, pronta pra usar.", price: 9.0, category: "Plantas", image: img("salsinha.png"), stock: 40 },
  { title: "Muda de tomate cereja", description: "Muda de tomate cereja vigorosa, 30cm.", price: 14.0, category: "Plantas", image: img("tomate-cereja.png"), stock: 35 },
  { title: "Muda de alecrim", description: "Alecrim aromático em vaso de 12cm.", price: 11.5, category: "Plantas", image: img("alecrim.png"), stock: 40 },
  // SEMENTES
  { title: "Sementes de tomate cereja", description: "Pacote com 50 sementes. Germina em 7 dias.", price: 8.9, category: "Sementes", isSeed: true, image: img("tomate-cereja.png"), stock: 100 },
  { title: "Sementes de alface variada", description: "Mix de 4 variedades de alface. 200 sementes.", price: 6.0, category: "Sementes", isSeed: true, image: img("alface.png"), stock: 80 },
  { title: "Sementes de manjericão", description: "Manjericão verde tradicional. 100 sementes.", price: 5.5, category: "Sementes", isSeed: true, image: img("manjericao.png"), stock: 90 },
  { title: "Sementes de pimenta dedo-de-moça", description: "Pimenta dedo-de-moça brasileira. 30 sementes.", price: 7.5, category: "Sementes", isSeed: true, image: img("pimenta.png"), stock: 60 },
  { title: "Sementes de girassol anão", description: "Girassol anão ornamental. 25 sementes.", price: 9.9, category: "Sementes", isSeed: true, image: img("girassol.jpg"), stock: 50 },
  { title: "Sementes de cenoura nantes", description: "Variedade nantes, raízes longas e doces. 500 sementes.", price: 6.5, category: "Sementes", isSeed: true, image: img("cenoura.png"), stock: 70 },
  { title: "Sementes de couve manteiga", description: "Couve manteiga tradicional. 100 sementes.", price: 5.0, category: "Sementes", isSeed: true, image: img("couve.png"), stock: 80 },
  { title: "Sementes crioulas mix de pimentas", description: "5 variedades de pimentas brasileiras. 80 sementes.", price: 19.9, category: "Sementes", isSeed: true, image: img("pimenta-mix.png"), stock: 40 },
  { title: "Sementes de coentro", description: "Coentro brasileiro, alto rendimento. 200 sementes.", price: 4.9, category: "Sementes", isSeed: true, image: img("coentro.png"), stock: 100 },
  { title: "Sementes de salsa lisa", description: "Salsa lisa tradicional. 150 sementes.", price: 5.5, category: "Sementes", isSeed: true, image: img("salsinha.png"), stock: 75 },
  { title: "Sementes de melancia", description: "Melancia crimson sweet. 20 sementes.", price: 8.0, category: "Sementes", isSeed: true, image: img("melancia.jpg"), stock: 50 },
  { title: "Sementes de abóbora moranga", description: "Abóbora moranga tradicional. 30 sementes.", price: 7.0, category: "Sementes", isSeed: true, image: img("abobora.png"), stock: 60 },
];

const PASSWORD = "123456";
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function wipe() {
  console.log("Limpando dados antigos...");
  // apaga posts/ratings/messages (cascata cuida de filhos)
  await admin.from("messages").delete().neq("id", 0);
  await admin.from("ratings").delete().neq("id", 0);
  await admin.from("posts").delete().neq("id", 0);
  // apaga todos os usuários auth (cascata apaga profiles)
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  for (const u of data.users) {
    await admin.auth.admin.deleteUser(u.id);
  }
}

async function createUser(u, role) {
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: u.name, role, city: u.city, state: u.state },
  });
  if (error) throw error;
  const id = data.user.id;
  // completa o profile com bio/lat/lon (o trigger já criou o básico)
  await admin.from("profiles").update({
    bio: u.bio ?? null,
    latitude: u.latitude ?? null,
    longitude: u.longitude ?? null,
  }).eq("id", id);
  return id;
}

async function main() {
  console.log("Populando o Supabase do Mark Fruit...");
  await wipe();

  console.log("Criando consumidores...");
  for (const c of CONSUMERS) await createUser(c, "CONSUMER");

  console.log("Criando produtores...");
  const producerIds = [];
  for (const p of PRODUCERS) producerIds.push(await createUser(p, "PRODUCER"));

  console.log("Inserindo produtos...");
  const rows = PRODUCTS.map((p) => ({
    title: p.title,
    description: p.description,
    price: p.price,
    image: p.image,
    category: p.category,
    is_seed: !!p.isSeed,
    stock: p.stock,
    author_id: rand(producerIds),
  }));
  const { data: inserted, error } = await admin.from("posts").insert(rows).select("id");
  if (error) throw error;

  // algumas avaliações
  console.log("Criando avaliações...");
  const { data: consumers } = await admin.from("profiles").select("id").eq("role", "CONSUMER");
  const comments = ["Excelente, recomendo!", "Chegou super fresco.", "Boa qualidade.", "Comprarei mais.", "Tava ok."];
  const ratings = [];
  for (const post of inserted) {
    if (Math.random() > 0.4) {
      for (const c of consumers) {
        if (Math.random() > 0.5) {
          ratings.push({
            post_id: post.id, user_id: c.id,
            stars: Math.random() > 0.25 ? 5 : 4,
            comment: rand(comments),
          });
        }
      }
    }
  }
  if (ratings.length) await admin.from("ratings").insert(ratings);

  console.log(`\nPronto! ${PRODUCTS.length} produtos criados.`);
  console.log("Logins de teste (senha: 123456):");
  console.log("  Consumidores: ana@markfruit.com / pedro@markfruit.com");
  console.log("  Produtores: joaquim, maria, valeverde, luiz, bemestar, sementes (@markfruit.com)");
}

main().catch((e) => { console.error(e); process.exit(1); });
