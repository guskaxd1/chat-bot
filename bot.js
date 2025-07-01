const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, Buttons, List, MessageMedia } = require('whatsapp-web.js');
const http = require('http');

// Configuração do cliente com autenticação persistente e flags do Puppeteer
const client = new Client({
    authStrategy: new LocalAuth(), // Salva a sessão para evitar QR code repetido
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Flags para compatibilidade com Render
    }
});

// Endpoint HTTP para manter o bot ativo (UptimeRobot)
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is alive!');
}).listen(process.env.PORT || 3000);

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp conectado.✅');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

// Funil
client.on('message', async msg => {
    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i) && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000); // Delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000); // Delay de 3 segundos
        const contact = await msg.getContact(); // Pegando o contato
        const name = contact.pushname; // Pegando o nome do contato
        await client.sendMessage(msg.from,'Olá! '+ name.split(" ")[0] + ' tudo bem? quem te enviou essa mensagem foi um robo criado por guskaxd.'); //Primeira mensagem de texto
    }
});