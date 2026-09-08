const usersSeed = [
    {
        username: 'alexsandro.luna',
        name: 'Alexsandro Luna',
        password: '123456',
        unit: 'Matriz',
        department: 'Financeiro'
    },
    {
        username: 'ana.souza',
        name: 'Ana Souza',
        password: '123456',
        unit: 'Matriz',
        department: 'Administrativo'
    },
    {
        username: 'carlos.lima',
        name: 'Carlos Lima',
        password: '123456',
        unit: 'Filial São Paulo',
        department: 'Comercial'
    },
    {
        username: 'beatriz.rocha',
        name: 'Beatriz Rocha',
        password: '123456',
        unit: 'Matriz',
        department: 'Recursos Humanos'
    }
];

const catalog = {
    'Impressora': [
        'Instalação',
        'Impressora não funciona',
        'Sem impressão',
        'Troca de toner',
        'Falta de papel',
        'Mudança de local'
    ],
    'Desktop e Notebooks': [
        'Computador não liga',
        'Lentidão',
        'Tela/monitor',
        'Teclado ou mouse',
        'Instalação de software',
        'Troca de equipamento'
    ],
    'Acesso e senha': [
        'Redefinição de senha',
        'Bloqueio de conta',
        'Novo acesso',
        'Alteração de permissão',
        'VPN'
    ],
    'E-mail e colaboração': [
        'E-mail não envia/recebe',
        'Caixa cheia',
        'Criação de e-mail',
        'Lista de distribuição',
        'Microsoft Teams'
    ],
    'Rede e internet': [
        'Sem conexão',
        'Internet lenta',
        'Wi-Fi',
        'Cabo de rede',
        'VPN'
    ],
    'Sistemas corporativos': [
        'Erro no sistema',
        'Novo acesso',
        'Permissão',
        'Lentidão',
        'Dúvida de uso'
    ],
    'Telefonia': [
        'Ramal sem funcionar',
        'Criação/alteração de ramal',
        'Chamadas',
        'Headset'
    ],
    'Solicitações gerais': [
        'Dúvida',
        'Orientação técnica',
        'Visita técnica',
        'Outro'
    ]
};

const req = [
    'Instalação',
    'Troca de toner',
    'Mudança de local',
    'Instalação de software',
    'Troca de equipamento',
    'Redefinição de senha',
    'Novo acesso',
    'Alteração de permissão',
    'Criação de e-mail',
    'Lista de distribuição',
    'Criação/alteração de ramal',
    'Orientação técnica',
    'Visita técnica'
];

const slas = {
    Requisição: {
        Baixa: 18,
        Média: 10,
        Alta: 6
    },
    Incidente: {
        Baixa: 6,
        Média: 4,
        Alta: 2
    }
};

const rules = [
    [
        'Impressora',
        'Impressora não funciona',
        /impressora.*(não|nao).*(imprime|funciona)|não.*imprime/
    ],
    [
        'Impressora',
        'Troca de toner',
        /toner|tonner/
    ],
    [
        'Desktop e Notebooks',
        'Computador não liga',
        /(computador|notebook).*(não|nao).*(liga|inicia)/
    ],
    [
        'Desktop e Notebooks',
        'Lentidão',
        /lento|lentidão|travando/
    ],
    [
        'Acesso e senha',
        'Bloqueio de conta',
        /conta.*bloquead|bloqueio/
    ],
    [
        'Acesso e senha',
        'Redefinição de senha',
        /esqueci.*senha|redefin.*senha/
    ],
    [
        'E-mail e colaboração',
        'E-mail não envia/recebe',
        /e-?mail.*(não|nao).*(envia|recebe)|email.*(não|nao).*(envia|recebe)/
    ],
    [
        'Rede e internet',
        'Sem conexão',
        /sem.*(internet|conexão|conexao)|não.*conecta/
    ],
    [
        'Rede e internet',
        'Internet lenta',
        /internet.*lent|rede.*lent/
    ]
];

const state = {
    step: 'username',
    data: {}
};

const messages = document.querySelector('#messages');
const quick = document.querySelector('#quick');
const input = document.querySelector('#input');
const analysis = document.querySelector('#analysis');
function directory() {
    const raw = localStorage.getItem('itsm-demo-users');

    if (!raw) {
        localStorage.setItem(
            'itsm-demo-users',
            JSON.stringify(usersSeed)
        );

        return usersSeed;
    }

    return JSON.parse(raw);
}

function say(t, k = 'bot') {
    const e = document.createElement('div');

    e.className = `bubble ${k}`;
    e.textContent = t;

    messages.append(e);
    messages.scrollTop = messages.scrollHeight;
}

function choices(items) {
    quick.innerHTML = '';

    items.forEach(x => {
        const b = document.createElement('button');

        b.textContent = x;
        b.onclick = () => reply(x);

        quick.append(b);
    });

    input.disabled = items.length > 0;
    input.placeholder = items.length
        ? 'Escolha uma opção ou aguarde'
        : 'Digite sua mensagem...';
}

function ask(t, items = []) {
    say(t);
    choices(items);

    if (!input.disabled) {
        input.focus();
    }
}

function renderAnalysis() {

    const data = [
        ['Usuário', state.data.username],
        ['Serviço', state.data.service],
        ['Subcategoria', state.data.subcategory],
        ['Tipo', state.data.type],
        ['Prioridade', state.data.priority],
        [
            'SLA',
            state.data.sla && `${state.data.sla} horas`
        ]
    ].filter(x => x[1]);

    analysis.innerHTML = data.length
        ? data.map(x => `
            <div class="field">
                <span>${x[0]}</span>
                <strong>${x[1]}</strong>
            </div>
        `).join('')
        : '<div class="empty">Aguardando informações da conversa.</div>';
}

function infer(text) {

    const low = text.toLowerCase();

    const rule = rules.find(r => r[2].test(low));

    if (rule) {
        state.data.service = rule[0];
        state.data.subcategory = rule[1];
    }

    state.data.priority =
        /urgente|crític|critico|parado|impacto alto/.test(low)
            ? 'Alta'
            : /médio|medio/.test(low)
                ? 'Média'
                : 'Baixa';

    state.data.description = text;

    if (state.data.subcategory) {

        state.data.type = req.includes(state.data.subcategory)
            ? 'Requisição'
            : 'Incidente';

        state.data.sla =
            slas[state.data.type][state.data.priority];
    }
}
function create() {

    const list = JSON.parse(
        localStorage.getItem('itsm-demo-tickets') || '[]'
    );

    const id =
        Math.max(...list.map(t => t.id), 1000) + 1;

    const t = {
        id,
        requester: state.data.username,
        service: state.data.service,
        subcategory: state.data.subcategory,
        type: state.data.type,
        priority: state.data.priority,
        sla: state.data.sla,
        status: 'Aberto',
        responsible: null,
        openedAt: new Date().toISOString(),
        description: state.data.description
    };

    list.push(t);

    localStorage.setItem(
        'itsm-demo-tickets',
        JSON.stringify(list)
    );

    localStorage.setItem(
        'itsm-demo-seed-version',
        '3'
    );

    return t;
}

function reset() {

    state.step = 'username';
    state.data = {};

    renderAnalysis();

    ask(
        'Olá! Sou o Agente de TI. Informe seu usuário corporativo para iniciar (ex.: alexsandro.luna).'
    );
}

function reply(value) {

    if (!value.trim()) {
        return;
    }

    say(value, 'user');

    quick.innerHTML = '';

    if (state.step === 'username') {

        const u = directory().find(
            x => x.username === value.trim().toLowerCase()
        );

        if (!u) {

            ask(
                'Não encontrei esse usuário na base. Verifique o identificador ou solicite o cadastro à equipe de suporte.'
            );

            return;
        }

        state.data = {
            ...u
        };

        state.step = 'issue';

        renderAnalysis();

        ask(
            `Olá, ${u.name}. Descreva o que você precisa em uma frase. Por exemplo: “minha impressora não imprime” ou “meu notebook está lento”.`
        );

        return;
    }

    if (state.step === 'issue') {

        infer(value);

        renderAnalysis();

        if (!state.data.subcategory) {

            state.step = 'service';

            ask(
                'Entendi a solicitação, mas preciso que você indique o serviço.',
                Object.keys(catalog)
            );

            return;
        }

        state.step = 'confirm';

        ask(
            `Identifiquei: ${state.data.service} / ${state.data.subcategory}.\nClassificação: ${state.data.type}; prioridade ${state.data.priority}; SLA de ${state.data.sla} horas.\n\nPosso criar o chamado?`,
            [
                'Criar chamado',
                'Recomeçar'
            ]
        );

        return;
    }
}
    if (state.step === 'service') {

        state.data.service = value;

        state.step = 'subcategory';

        ask(
            'Escolha a subcategoria.',
            catalog[value]
        );

        return;
    }

    if (state.step === 'subcategory') {

        state.data.subcategory = value;

        state.data.type = req.includes(value)
            ? 'Requisição'
            : 'Incidente';

        state.data.sla =
            slas[state.data.type][state.data.priority || 'Baixa'];

        state.step = 'confirm';

        renderAnalysis();

        ask(
            `Classificação: ${state.data.type}; SLA de ${state.data.sla} horas. Posso criar o chamado?`,
            [
                'Criar chamado',
                'Recomeçar'
            ]
        );

        return;
    }

    if (state.step === 'confirm') {

        if (value === 'Recomeçar') {

            reset();

            return;
        }

        const t = create();

        state.step = 'done';

        ask(
            `Chamado criado com sucesso.\n\nProtocolo: #2026-${t.id}\nSolicitante: ${t.requester}\nStatus: Aberto\nSLA: até ${t.sla} horas.`,
            [
                'Abrir outro chamado'
            ]
        );

        return;
    }

    reset();
}

document.querySelector('#composer').onsubmit = e => {

    e.preventDefault();

    if (!input.disabled) {

        const v = input.value;

        input.value = '';

        reply(v);
    }
};

reset();
