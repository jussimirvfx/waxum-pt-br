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
