# Plano: Restaurar tema preto/branco fixo

## Context
O usuário alterou o CSS para suportar `prefers-color-scheme` (modo claro), mas agora quer **voltar ao tema escuro fixo** (fundo preto, texto branco) que era o original.

### Problema identificado:
- A seção `@media (prefers-color-scheme: light)` modifica as variáveis CSS para cores claras
- Isso faz com que em sistemas com modo claro ativado, o site apareça com fundo cinza/claro
- O usuário quer **ignorar a preferência do sistema** e sempre usar tema escuro

## Objetivo
Restaurar o visual original:
- **Background**: Preto (#000000)
- **Textos**: Brancos (#ffffff)
- **Cards**: Brancos com transparência
- **Remover** a adaptação ao modo claro

## Arquivos a modificar

### 1. `css/styles.css`
**Linhas:** 14-27 (variáveis) + seção `@media (prefers-color-scheme: light)` (aprox. linhas 375-400)

**Alterações:**
- Remover completamente a seção `@media (prefers-color-scheme: light)`
- Garantir que as variáveis `:root` tenham valores escuros fixos:
  - `--bg-primary: #000000`
  - `--text-primary: #ffffff`
  - `--card-bg: rgba(255, 255, 255, 0.95)` (mantém)
- Manter `clamp()` para tipografia responsiva (opcional, não afeta cores)
- Garantir `body` usa `background: var(--bg-primary)` e `color: var(--text-primary)`

**Código a ser removido:** Toda a seção desde `@media (prefers-color-scheme: light)` até o final do arquivo (linhas ~375-400)

## Verificação

### Teste manual:
1. Abrir site no Vercel
2. Verificar se fundo é **preto** (não cinza)
3. Verificar se textos são **brancos**
4. Testar com system preference em "Light Mode" - deve permanecer escuro
5. Testar em outro navegador/device

### Critérios de aceitação:
- ✅ Background sólido preto
- ✅ Todos os textos visíveis em branco
- ✅ Ghost Grid desenhando linhas brancas
- ✅ Cards com fundo branco semi-transparente
- ✅ Ignora preferência do sistema operacional

## Comandos pós-modificação:
```bash
git add css/styles.css
git commit -m "Restaura tema escuro fixo (preto/branco)

- Remove suporte a prefers-color-scheme
- Garante background preto e texto branco sempre
- Remove adaptação ao modo claro do sistema

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push origin main
```

Após push, aguardar deploy Vercel e testar URL.

## Observações
- As outras melhorias (clamp, fallbacks, remoção de duplicação) devem ser mantidas
- Apenas a seção `prefers-color-scheme` será removida/inativada
- Se necessário, podemos Future: implementar um toggle manual dark/light (mas não é o caso atual)