console.log('Iniciando o bot...');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const http = require('http');
const fs = require('fs').promises; // Usando fs.promises para operações assíncronas

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});

const port = process.env.PORT || 3000;
console.log(`Iniciando servidor na porta ${port}...`);
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is alive!');
}).listen(port);

client.on('qr', qr => {
    console.log('QR Code gerado. Escaneie com o WhatsApp:');
    console.log(qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp conectado.✅');
    // Executa a cobrança automaticamente ao conectar
    checkCobrançaRecorrente();
});

client.on('auth_failure', (msg) => {
    console.error('Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
    console.error('Desconectado devido a:', reason);
    console.log('Tentando reiniciar o cliente...');
    client.initialize().catch(err => console.error('Erro ao reiniciar:', err));
});

client.on('message_ack', (msg, ack) => {
    console.log(`[DEBUG] Ack atualizado para mensagem ${msg.id._serialized}: ${ack}`);
    if (msg.to === '559883152782@c.us' && msg.fromMe) {
        if (ack > 0) {
            console.log(`[DEBUG] Mensagem entregue para 559883152782@c.us, Ack: ${ack}`);
        } else if (ack === -1) {
            console.error(`[DEBUG] Mensagem falhou para 559883152782@c.us, Ack: ${ack}`);
        }
    }
});

client.on('error', (error) => {
    console.error('Erro durante a inicialização:', error);
});

console.log('Inicializando cliente WhatsApp...');
client.initialize().catch(err => {
    console.error('Erro ao inicializar o cliente:', err);
});

const delay = ms => new Promise(res => setTimeout(res, ms));

// Função para enviar mensagem de cobrança com simulação aprimorada
const sendCobrançaMessage = async () => {
    if (!client || !client.pupPage) {
        console.error('Cliente ou página do Puppeteer não estão prontos.');
        return;
    }
    const contatoEspecifico = '559883152782@c.us'; // Número real do contato
    console.log(`[DEBUG] Definindo contatoEspecifico como: ${contatoEspecifico}`);
    const userName = 'Bueno'; // Substitua por um nome real ou ajuste dinamicamente
    const mensagem = `*Olá ${userName}*\n\nPassando para lembrar do pagamento referente ao sistema Money Bet:\n\n- *Valor:* R\$ 150,00\n- *Pix:* 08822469330\n- *Nome:* Guskov da Silva Coelho\n\n*Confirmação de Pagamento*\n 
    (Digite *'1'* após realizar a sua transação)`;
    try {
        console.log(`[DEBUG] Tentando enviar para: ${contatoEspecifico}`);
        const sentMessage = await client.sendMessage(contatoEspecifico, mensagem);
        console.log(`[DEBUG] Mensagem enviada com sucesso para: ${contatoEspecifico}, ID: ${sentMessage.id._serialized}, Ack inicial: ${sentMessage.ack}`);
        if (sentMessage.ack === 0) {
            console.log(`[DEBUG] Aguardando confirmação de entrega para ${contatoEspecifico}`);
        }
    } catch (err) {
        console.error(`[DEBUG] Erro ao enviar mensagem para ${contatoEspecifico}:`, err);
    }
};

// Função para processar a confirmação
client.on('message', async msg => {
    if (msg.body === '1' && msg.from === '559883152782@c.us') {
        console.log(`[DEBUG] Confirmação recebida de ${msg.from}`);
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias depois
        await fs.writeFile('lastCobrança.txt', thirtyDaysLater.toISOString(), 'utf8');
        console.log(`[DEBUG] Próxima cobrança agendada para: ${thirtyDaysLater.toISOString()}`);
        await client.sendMessage(msg.from, 'Pagamento confirmado! A próxima cobrança será em 30 dias.');
    }
});

// Função para verificar e disparar a cobrança recorrente
const checkCobrançaRecorrente = async () => {
    try {
        const lastCobrança = await fs.readFile('lastCobrança.txt', 'utf8').catch(() => null);
        const now = new Date();
        const lastDate = lastCobrança ? new Date(lastCobrança) : null;
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000; // 30 dias

        if (!lastDate || (now >= lastDate)) { // Verifica se a data passou ou é a primeira execução
            await sendCobrançaMessage();
        }
    } catch (err) {
        console.error('Erro ao verificar cobrança recorrente:', err);
    }
};


//ctt: pai: 559883152782 lulubot: 553184357643 eu: 5598988709578 mãe: 5598985309400 lorena: 5598985415345 mozi: 5598991729256
//node bot.js