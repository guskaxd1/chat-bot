const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia, LocalAuth } = require('whatsapp-web.js');

// Cria cliente com Puppeteer sem sandbox (obrigatório no Render)
const client = new Client({
    authStrategy: new LocalAuth(), // Armazena sessão no diretório .wwebjs_auth
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Geração de QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Conexão pronta
client.on('ready', () => {
    console.log('✅ WhatsApp conectado.');
});

// Inicializa o cliente
client.initialize();

// Função de delay
const delay = ms => new Promise(res => setTimeout(res, ms));

// Funil de mensagens
client.on('message', async msg => {
    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i) && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo';
        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, `Olá, ${name.split(" ")[0]}! Tudo bem? 🤖`);
        
        await delay(2000);
        await chat.sendStateTyping();
        await client.sendMessage(msg.from, `Eu sou um robô criado por *guskaxd*! 😎`);
    }
});
