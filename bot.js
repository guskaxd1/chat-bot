console.log('Iniciando o bot...');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, Buttons, List, MessageMedia } = require('whatsapp-web.js');
const http = require('http');

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
});

client.on('auth_failure', (msg) => {
    console.error('Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
    console.error('Desconectado:', reason);
});

client.on('error', (error) => {
    console.error('Erro durante a inicialização:', error);
});

console.log('Inicializando cliente WhatsApp...');
client.initialize().catch(err => {
    console.error('Erro ao inicializar o cliente:', err);
});

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('message', async msg => {
    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i) && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(1000);
        await chat.sendStateTyping();
        await delay(1000);
        const contact = await msg.getContact();
        const name = contact.pushname;
        await client.sendMessage(msg.from, 'Olá! ' + name.split(" ")[0] + ' tudo bem? quem te enviou essa mensagem foi um robo criado por guskaxd.');
    }
});