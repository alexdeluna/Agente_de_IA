# Agente de TI — Ambiente de Teste

Esta aplicação é independente do portal ITSM. Ela usa a mesma base local do navegador apenas para a demonstração: o ticket criado pelo agente aparece na fila do portal.

O arquivo `agent.js` concentra o orquestrador do agente e a função `create()` representa o conector de ITSM. Em uma futura integração com GLPI, esse ponto será substituído por uma chamada à API do GLPI, sem modificar a interface ou as regras de conversa.
