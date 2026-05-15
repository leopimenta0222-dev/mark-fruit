import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma.js";

// As imagens ficam em frontend/public/products/ — são servidas
// localmente, então nunca quebram e funcionam até offline.
const img = (file) => `/products/${file}`;

async function main() {
  console.log("🌱 Populando banco com dados de exemplo...");

  const hash = await bcrypt.hash("123456", 10);

  await prisma.message.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const consumer = await prisma.user.create({
    data: { name: "Ana Consumidora", email: "ana@markfruit.com", password: hash,
      role: "CONSUMER", city: "São Paulo", state: "SP",
      latitude: -23.5505, longitude: -46.6333 },
  });
  const consumer2 = await prisma.user.create({
    data: { name: "Pedro Cliente", email: "pedro@markfruit.com", password: hash,
      role: "CONSUMER", city: "Rio de Janeiro", state: "RJ",
      latitude: -22.9068, longitude: -43.1729 },
  });

  const producers = await Promise.all([
    prisma.user.create({ data: { name: "Sítio do Joaquim", email: "joaquim@markfruit.com", password: hash, role: "PRODUCER",
      city: "Mogi das Cruzes", state: "SP", bio: "Produzo orgânicos há 20 anos no sítio da família.",
      latitude: -23.5235, longitude: -46.1857 } }),
    prisma.user.create({ data: { name: "Horta da Maria", email: "maria@markfruit.com", password: hash, role: "PRODUCER",
      city: "Campinas", state: "SP", bio: "Hortaliças frescas direto da horta.",
      latitude: -22.9099, longitude: -47.0626 } }),
    prisma.user.create({ data: { name: "Fazenda Vale Verde", email: "valeverde@markfruit.com", password: hash, role: "PRODUCER",
      city: "Atibaia", state: "SP", bio: "Produção sustentável de frutas tropicais e cítricas.",
      latitude: -23.1170, longitude: -46.5503 } }),
    prisma.user.create({ data: { name: "Pomar do Luiz", email: "luiz@markfruit.com", password: hash, role: "PRODUCER",
      city: "Petrópolis", state: "RJ", bio: "Pomar familiar com frutas da serra.",
      latitude: -22.5050, longitude: -43.1786 } }),
    prisma.user.create({ data: { name: "Chácara Bem Estar", email: "bemestar@markfruit.com", password: hash, role: "PRODUCER",
      city: "Embu das Artes", state: "SP", bio: "Verduras hidropônicas e ervas aromáticas.",
      latitude: -23.6489, longitude: -46.8525 } }),
    prisma.user.create({ data: { name: "Sítio Sementes do Bem", email: "sementes@markfruit.com", password: hash, role: "PRODUCER",
      city: "Holambra", state: "SP", bio: "Especializados em sementes crioulas e mudas.",
      latitude: -22.6346, longitude: -47.0567 } }),
  ]);

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const products = [
    // FRUTAS
    { title: "Tomate orgânico 1kg", description: "Tomates colhidos hoje, sem agrotóxicos, super saborosos. Ideais para saladas e molhos.", price: 12.5, category: "Frutas", image: img("tomate.png"), stock: 50 },
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

    // PLANTAS (mudas de ervas e frutas)
    { title: "Muda de manjericão", description: "Muda de manjericão saudável em vaso de 12cm. Ótima pra horta caseira.", price: 12.0, category: "Plantas", image: img("manjericao.png"), stock: 50 },
    { title: "Muda de hortelã", description: "Muda de hortelã pronta pra transplantar.", price: 10.0, category: "Plantas", image: img("hortela.png"), stock: 45 },
    { title: "Muda de limoeiro siciliano", description: "Limoeiro siciliano enxertado, 60cm. Começa a frutificar em 1 ano.", price: 65.0, category: "Plantas", image: img("limoeiro.png"), stock: 10 },
    { title: "Pé de morango", description: "Muda de morango variedade albion em vaso de 15cm.", price: 18.5, category: "Plantas", image: img("morango.png"), stock: 25 },
    { title: "Muda de salsinha", description: "Salsinha lisa em mini vaso, pronta pra usar na cozinha.", price: 9.0, category: "Plantas", image: img("salsinha.png"), stock: 40 },
    { title: "Muda de tomate cereja", description: "Muda de tomate cereja vigorosa, 30cm.", price: 14.0, category: "Plantas", image: img("tomate-cereja.png"), stock: 35 },
    { title: "Muda de alecrim", description: "Alecrim aromático em vaso de 12cm.", price: 11.5, category: "Plantas", image: img("alecrim.png"), stock: 40 },

    // SEMENTES
    { title: "Sementes de tomate cereja", description: "Pacote com 50 sementes. Germina em 7 dias.", price: 8.9, category: "Sementes", isSeed: true, image: img("tomate-cereja.png"), stock: 100 },
    { title: "Sementes de alface variada", description: "Mix de 4 variedades de alface. 200 sementes.", price: 6.0, category: "Sementes", isSeed: true, image: img("alface.png"), stock: 80 },
    { title: "Sementes de manjericão", description: "Manjericão verde tradicional. 100 sementes.", price: 5.5, category: "Sementes", isSeed: true, image: img("manjericao.png"), stock: 90 },
    { title: "Sementes de pimenta dedo-de-moça", description: "Pimenta dedo-de-moça brasileira. 30 sementes.", price: 7.5, category: "Sementes", isSeed: true, image: img("pimenta.png"), stock: 60 },
    { title: "Sementes de girassol anão", description: "Girassol anão ornamental. 25 sementes. Cresce até 60cm.", price: 9.9, category: "Sementes", isSeed: true, image: img("girassol.jpg"), stock: 50 },
    { title: "Sementes de cenoura nantes", description: "Variedade nantes, raízes longas e doces. 500 sementes.", price: 6.5, category: "Sementes", isSeed: true, image: img("cenoura.png"), stock: 70 },
    { title: "Sementes de couve manteiga", description: "Couve manteiga tradicional. 100 sementes.", price: 5.0, category: "Sementes", isSeed: true, image: img("couve.png"), stock: 80 },
    { title: "Sementes crioulas mix de pimentas", description: "5 variedades de pimentas brasileiras. 80 sementes.", price: 19.9, category: "Sementes", isSeed: true, image: img("pimenta-mix.png"), stock: 40 },
    { title: "Sementes de coentro", description: "Coentro brasileiro, alto rendimento. 200 sementes.", price: 4.9, category: "Sementes", isSeed: true, image: img("coentro.png"), stock: 100 },
    { title: "Sementes de salsa lisa", description: "Salsa lisa tradicional. 150 sementes.", price: 5.5, category: "Sementes", isSeed: true, image: img("salsinha.png"), stock: 75 },
    { title: "Sementes de melancia", description: "Melancia crimson sweet. 20 sementes.", price: 8.0, category: "Sementes", isSeed: true, image: img("melancia.jpg"), stock: 50 },
    { title: "Sementes de abóbora moranga", description: "Abóbora moranga tradicional. 30 sementes.", price: 7.0, category: "Sementes", isSeed: true, image: img("abobora.png"), stock: 60 },
  ];

  const posts = [];
  for (const prod of products) {
    const post = await prisma.post.create({
      data: { ...prod, authorId: rand(producers).id },
    });
    posts.push(post);
  }

  const comments = {
    5: ["Excelente! Recomendo demais.", "Produto top, chegou super fresco.", "Maravilhoso, comprarei mais!", "Melhor que mercado, sem dúvida.", "Adorei, qualidade impecável."],
    4: ["Bom produto, valeu a pena.", "Gostei bastante, recomendo.", "Veio bem fresquinho.", "Boa qualidade, voltarei a comprar."],
    3: ["Tava ok, nada de mais.", "Razoável pelo preço.", "Esperava um pouco mais."],
  };
  const consumers = [consumer, consumer2];

  for (const post of posts) {
    if (Math.random() > 0.4) {
      for (const c of consumers) {
        if (Math.random() > 0.5) {
          const stars = Math.random() > 0.2 ? (Math.random() > 0.4 ? 5 : 4) : 3;
          const cs = comments[stars];
          await prisma.rating.create({
            data: {
              postId: post.id, userId: c.id, stars,
              comment: cs[Math.floor(Math.random() * cs.length)],
            },
          });
        }
      }
    }
  }

  console.log(`✅ ${products.length} produtos criados com imagens locais!`);
  console.log("");
  console.log("Logins de teste (senha: 123456):");
  console.log("  Consumidores: ana@markfruit.com  /  pedro@markfruit.com");
  console.log("  Produtores: joaquim, maria, valeverde, luiz, bemestar, sementes  (@markfruit.com)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
