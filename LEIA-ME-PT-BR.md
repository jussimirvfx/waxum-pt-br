# Waxum em português brasileiro

Versão de apresentação baseada no Waxum 0.16.1, commit upstream
`851bedf3189bda742433ef57bc06e75be590860b`, distribuída sob a mesma licença MIT.

O login, as sessões, os formulários, os estados e o explorador da API foram
traduzidos. Rotas, campos JSON, valores de enumerações, identificadores,
autenticação, banco de dados e protocolo do WhatsApp permanecem compatíveis.
O explorador exibe opções traduzidas, mas envia os valores originais.
Respostas JSON, códigos, erros técnicos recebidos da API e nomes próprios de
produtos mantêm sua representação original. O Swagger e a documentação técnica
upstream permanecem disponíveis no idioma original.

Verificação do contrato da interface: `node scripts/check-console-contract.cjs`.
Teste nativo existente: `cargo test --locked --test console_cloud`.

As traduções são incorporadas ao binário durante a compilação. Atualizações
upstream precisam incorporar e validar novamente estes arquivos antes de
substituir esta versão. Nenhuma credencial ou dado de uma instalação faz parte
deste repositório.

## Verificação de atualizações do WhatsApp

O workflow **Upstream whatsapp-rust** acompanha uma dependência externa; ele
não publica nem reinicia a instalação na VPS. Neste fork, a execução agendada
fica desativada por padrão, em linha com a revisão por versão descrita em
`docs/DEPENDENCIES.md`. A revisão usada pelo app permanece fixada em
`Cargo.toml` e `Cargo.lock` até uma atualização revisada.

Para consultar a compatibilidade, execute o workflow manualmente em Actions,
deixando `create_pr` desmarcado. O resultado aparece no resumo da execução e
no artefato `upstream-whatsapp-rust-report`, com os logs completos, inclusive
quando a dependência nova não compila. Uma incompatibilidade relatada se
refere à revisão candidata, não à versão instalada.

A criação de PR é opcional e usa este repositório e sua branch padrão
(`pt-br`). Para habilitá-la, é necessário permitir que Actions crie PRs nas
configurações do GitHub ou fornecer o secret `UPSTREAM_BUMP_TOKEN`. A variável
de Actions `ENABLE_UPSTREAM_BUMPS=true` também habilita os bumps agendados no
fork. Nenhum desses modos faz merge ou deploy automático.
