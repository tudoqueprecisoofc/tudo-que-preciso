# Tudo que Preciso — vitrine de afiliados do Mercado Livre

Site estático (HTML, CSS e JS puro, sem bibliotecas). Os produtos ficam em `public_html/products.json`.

```
public_html/
├── index.html          página principal
├── sobre.html          página "Sobre"
├── privacidade.html    política de privacidade
├── products.json       ← todos os produtos (edite aqui)
├── favicon.ico / favicon.png / apple-touch-icon.png
└── assets/
    ├── css/style.css
    ├── js/app.js
    └── img/            banners, logo e imagem de compartilhamento
vercel.json             diz ao Vercel para publicar a pasta public_html
```

---

## 1. Como colocar no ar

### Opção recomendada: GitHub + Vercel (grátis, a mais simples)

1. **GitHub**: crie um repositório (ex.: `tudo-que-preciso`) e envie todo o conteúdo desta pasta, mantendo `vercel.json` e `public_html/` na raiz do repositório.
   - Pelo site: *Add file → Upload files* e arraste as pastas.
2. **Vercel**: acesse vercel.com → *Add New… → Project* → escolha o repositório do GitHub → *Import*.
   - **Framework Preset:** `Other`
   - **Root Directory:** deixe a raiz (`./`)
   - **Output Directory:** o `vercel.json` já configura `public_html`; não precisa mudar nada.
   - Clique em **Deploy**. Em ~30 segundos o site fica em `https://SEU-PROJETO.vercel.app`.
3. **Atualizações**: toda vez que você editar um arquivo no GitHub (por exemplo o `products.json`), o Vercel publica a nova versão sozinho em poucos segundos.
4. **Domínio próprio (opcional)**: no Vercel, *Project → Settings → Domains → Add*.

> Depois de saber o endereço final, troque `https://tudo-que-preciso.vercel.app/` pelo seu endereço em `index.html` (tags `canonical` e `og:url`/`og:image`) e em `sobre.html`. Isso garante a imagem certa ao compartilhar no WhatsApp.

### Opção 2: Lovable

O Lovable trabalha com projetos próprios (React), então ele **não publica** um site estático vindo do GitHub do jeito que está. Para usar o Lovable:

1. Crie um projeto novo no Lovable e conecte ao GitHub (*GitHub → Connect*). O Lovable cria um repositório novo.
2. Peça ao Lovable para "recriar este site a partir dos arquivos" e envie `index.html`, `style.css`, `app.js` e `products.json`.
3. Publique com o botão **Publish**.

Como isso reescreve o código, prefira o Vercel: ele publica exatamente estes arquivos, sem conversão.

### Testar no seu computador

O site lê o `products.json`, então ele não funciona abrindo o `index.html` com dois cliques. Rode um servidor local dentro da pasta:

```
cd public_html
python -m http.server 8000
```

Depois abra http://localhost:8000.

### Google Analytics

Em `index.html`, procure o bloco comentado `Google Analytics`, troque `G-XXXXXXXXXX` pelo seu ID e apague as marcas `<!--` e `-->` em volta dele.

---

## 2. Como trocar a imagem do banner

As imagens ficam em `public_html/assets/img/`:

| Arquivo | Onde aparece | Tamanho sugerido |
|---|---|---|
| `banner-desktop.webp` | computador (telas grandes) | 2100 × 750 px |
| `banner-desktop-1280.webp` | notebooks / tablets | 1280 × 456 px |
| `banner-celular.webp` | celular | 1024 × 1536 px (vertical) |

**Jeito mais fácil:** salve sua nova imagem com **o mesmo nome** e substitua o arquivo (no GitHub: abra a pasta `public_html/assets/img` → *Add file → Upload files* → envie com o mesmo nome).

- Deixe o **lado esquerdo** da imagem de computador e a **parte de cima** da imagem de celular mais escuros e sem produtos, porque o texto do banner fica nesses lugares.
- Se a sua imagem for `.png` ou `.jpg`, você pode converter para `.webp` em squoosh.app ou trocar o nome do arquivo direto no `index.html` (procure por `banner-`).
- O texto do banner ("Tudo o que você precisa…") fica no `index.html`, dentro de `<div class="hero-text">`.

---

## 3. Como adicionar, remover ou editar produtos (`products.json`)

Você pode editar direto no GitHub: abra `public_html/products.json` → ícone de lápis → edite → *Commit changes*. O Vercel atualiza o site sozinho.

Cada produto é um bloco assim:

```json
{
  "id": "eletrodomesticos-01",
  "category": "eletrodomesticos",
  "rank": 1,
  "name": "Chaleira Elétrica Atacama 1,8 L Unitermi",
  "price": 40.21,
  "oldPrice": null,
  "priceIsPix": false,
  "image": "https://http2.mlstatic.com/D_NQ_NP_....webp",
  "affiliateLink": "https://meli.la/XXXXXXX",
  "checkedAt": "2026-11-02"
}
```

| Campo | O que é |
|---|---|
| `id` | Código único do produto (não repita). Os favoritos dos visitantes usam esse código. |
| `category` | Um dos `id` da lista `categories` no topo do arquivo. |
| `rank` | Posição no ranking de mais vendidos do ML (1, 2, 3…). |
| `name` | Nome que aparece no card. |
| `price` | Preço sem "R$", com **ponto** nos centavos: `1233` ou `40.21`. |
| `oldPrice` | Preço riscado, só se aparecer no anúncio. Senão use `null`. |
| `priceIsPix` | `true` se o preço mostrado no ML é o preço **no Pix**; senão `false`. |
| `image` | Endereço da foto oficial do anúncio (botão direito na foto do ML → *Copiar endereço da imagem*). |
| `affiliateLink` | Seu link `meli.la` gerado na barra de afiliados (*Compartilhar*). |
| `checkedAt` | Data em que você conferiu o preço (`AAAA-MM-DD`). Aparece como "Preço consultado em DD/MM". |

**Adicionar:** copie um bloco inteiro, cole logo depois de outro (coloque uma **vírgula** entre os blocos) e troque os valores.
**Remover:** apague o bloco inteiro, do `{` até o `}`, e a vírgula que sobrar.
**Editar:** mude só o valor entre as aspas (ou o número).

Atualize também `"updatedAt"` no topo do arquivo. Ele aparece como "Atualizado em DD/MM".

**Nova categoria:** adicione um item em `categories`, por exemplo `{ "id": "games", "name": "Games", "icon": "todas" }`. Ícones disponíveis: `eletrodomesticos`, `celulares`, `informatica`, `eletronicos`, `ferramentas`, `beleza`, `todas`.

**Antes de salvar**, confira se o JSON está válido em jsonlint.com. Uma vírgula a mais ou a menos faz os produtos não aparecerem.

### Regras de honestidade (mantenha)
- Use só o link de afiliado gerado pela barra do Mercado Livre e teste se ele abre o produto certo.
- Não invente desconto, avaliação ou contagem de vendas. O preço riscado só entra se estiver no anúncio.
- Sempre que atualizar preços, atualize `checkedAt` e `updatedAt`.
