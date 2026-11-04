# Nome da sessão na lista do painel

O CRM envia `name` na criação. O ID `crm-{tenant}-{canal}` é uma identidade
estável de autorização, webhooks e persistência; nunca deve ser renomeado para
melhorar a apresentação. O CSS destaca o nome existente e mantém o ID na tela
de detalhes e nos links. Sessões sem nome distinto continuam mostrando o ID.

O painel e seu CSS estão embutidos no binário. Para aplicar esta alteração de
aparência sem reiniciar sessões conectadas, `activate.py` extrai o mesmo bloco
de CSS do fonte e injeta um stylesheet adicional somente em `GET /`, pelo
Nginx existente. Não altera a API, autenticação, eventos, dados ou conexões.
O arquivo público contém apenas CSS e usa os tokens dos temas claro/escuro.

Executar como root no host dedicado, passando o CSS desta revisão e o site:

```
python3 activate.py /tmp/console.css /etc/nginx/sites-available/waxum
```

O script guarda a configuração anterior em diretório privado, executa
`nginx -t` e faz apenas recarga graciosa do Nginx. Em falha restaura a
configuração anterior. Confirme o stylesheet no HTML autenticado, a lista e
o número de reinícios do contêiner antes/depois. Não é necessário compilar
Rust no Mac ou reiniciar o Waxum para esta aplicação.

Após publicar um binário que já incorpore este CSS, remova os dois blocos
`console-session-names` do site e recarregue o Nginx com validação de sintaxe;
o stylesheet adicional se torna redundante. Em upgrades anteriores a isso,
confirme que `.cell-id` e `.cell-sub` ainda são as classes da lista.

Uma sessão antiga pode ter `name` igual ao ID. Se for necessário alinhar seu
nome ao CRM e não houver endpoint nativo para editar o nome, trate somente
esse metadado, com cópia privada do valor anterior, comparação do ID/nome
esperados e releitura. Nunca altere o ID, telefone, credenciais ou status.
