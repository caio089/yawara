# Deploy na Hostinger

## Domínio: onde configurar?

**Só na Hostinger.** Você não precisa apontar domínio em nenhum lugar no código.

- No **painel da Hostinger** você adiciona o domínio (ou subdomínio) e configura DNS se for um domínio externo.
- O projeto não tem domínio fixo no código: funciona em qualquer URL (seu dominio.com, www, etc.).

---

## 1. Build local (opcional, para testar)

```bash
npm ci
npm run build
```

A pasta `dist/` será gerada com os arquivos estáticos.

---

## 2. Deploy na Hostinger

### Opção A: Upload da pasta `dist/`

1. Rode `npm run build` no seu PC.
2. No **hPanel** (Hostinger): Arquivos → Gerenciador de Arquivos.
3. Entre na pasta **public_html** (ou na pasta do domínio que você configurou).
4. Apague o conteúdo antigo (se houver).
5. Envie **todo o conteúdo** da pasta `dist/` (não a pasta `dist` em si):
   - `index.html` na raiz
   - pasta `assets/`
   - pastas `images/`, `videos/` (se existirem em `dist/`)
   - arquivo `.htaccess` (para o React Router funcionar)

### Opção B: Git + Node na Hostinger

Se a Hostinger tiver suporte a Node.js (ex.: VPS ou plano com Node):

1. Conecte o repositório Git no painel.
2. Configure o comando de build: `npm ci && npm run build`.
3. Configure a pasta de publicação: `dist`.
4. Defina as variáveis de ambiente (veja abaixo).

---

## 3. Variáveis de ambiente (Supabase)

No projeto, o Supabase usa:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Se você fizer só upload da pasta `dist/`:**  
Essas variáveis são embutidas no build. Rode o build no seu PC **depois** de criar um `.env` com os valores corretos e use esse `dist/` para o upload. Não commite o `.env` no Git.

**Se a Hostinger tiver “Variáveis de ambiente” no painel:**  
Crie lá `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` e use o build que a própria Hostinger fizer (quando existir suporte a Node/build).

---

## 4. Checklist rápido

- [ ] Build: `npm run build` (pasta `dist/` gerada)
- [ ] Conteúdo de `dist/` enviado para `public_html` (ou pasta do domínio)
- [ ] `.htaccess` está dentro de `dist/` (vem de `public/.htaccess`) e foi enviado
- [ ] Domínio configurado só no painel da Hostinger (DNS / adicionar domínio)
- [ ] Se usar Supabase: URL e Anon Key corretos no build ou nas variáveis de ambiente

---

## 5. Resumo domínio

| Onde              | O que fazer |
|-------------------|-------------|
| **Hostinger**     | Adicionar domínio, apontar DNS (se for domínio externo), escolher pasta (ex.: public_html). |
| **Código do site** | Nada. O site funciona em qualquer domínio. |
