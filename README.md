# Controle de Vendas - Miplace

Sistema de seleção de lojas para controle de vendas com interface moderna e PWA.

## 🚀 Deploy no Vercel

### Método 1: Deploy Automático (Recomendado)

1. Faça push deste repositório para o GitHub
2. Acesse [vercel.com](https://vercel.com) e faça login
3. Clique em "New Project" e importe o repositório
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: (vazio)
   - **Output Directory**: (vazio)
5. Clique em "Deploy"

### Método 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

## 📁 Estrutura do Projeto

```
/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos customizados
├── js/
│   └── main.js         # Lógica da aplicação
├── sw.js               # Service Worker (PWA)
├── manifest.json       # Manifest PWA
├── assets/
│   └── images/         # Logos das lojas
├── vercel.json         # Configuração Vercel
└── .gitignore
```

## ✅ **Pós-Deploy Checklist**

- [ ] Teste se as imagens carregam corretamente
- [ ] Verifique se o Service Worker está ativo (DevTools > Application)
- [ ] Teste a instalação PWA no mobile
- [ ] Teste offline usando DevTools > Network (offline mode)
- [ ] Verificar se não há erros no console

## 🔧 Solução de Problemas

### Erro: "Failed to execute 'addAll' on 'Cache'"

**Causa**: Arquivos não encontrados nobuild/desdobramento.

**Solução**: 
- Verifique se todos os arquivos referenciados em `STATIC_ASSETS` existem
- No Vercel, caminhos devem ser relativos à raiz
- Use `vercel.json` para garantir MIME types corretos

### Erro: "cdn.tailwindcss.com should not be used in production"

**Causa**: Uso do CDN do Tailwind em produção.

**Solução**: Removido nesta versão. Todo CSS está em `styles.css`.

### Erro: "404 Not Found" em imagens

**Causa**: Nome do arquivo com capitalização errada.

**Solução**: Nome do arquivo no código deve ser exatamente igual ao do sistema de arquivos (case-sensitive).

## 📱 Suporte a PWA

O projeto inclui:
- ✅ Service Worker com cache strategy
- ✅ Manifest para instalação
- ✅ Responsivo
- ✅ Offline capable
- ✅ App-like experience

## 🔒 Segurança

- `rel="noopener noreferrer"` em links externos
- Content Security Policy via Vercel headers (recomendado)
- Sanitização de inputs (não aplicável - apenas links estáticos)

## 🎯 Melhorias Futuras

- [ ] Adicionar Analytics
- [ ] Implementar A/B testing para cores
- [ ] Adicionar rastreamento de cliques
- [ ] Criar landing page com SEO otimizado
- [ ] Adicionar suporte a múltiplos idiomas

## 📄 Licença

Proprietário - Miplace © 2025

---

**Desenvolvido com ❤️ seguindo as melhores práticas de 2025**