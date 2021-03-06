const { create, Client } = require('@open-wa/wa-automate')
const { color } = require('./utils')
const options = require('./utils/options')
const msgHandler = require('./handler/message')
const welcome = require('./lib/welcome')

const start = (client = new Client()) => {
    console.log('[DEV]', color('Slavyan', 'orange')) // Change your name and color here
    console.log('[CLIENT] Bot is now online!')

    // Force it to keep the current session
    client.onStateChanged((state) => {
        console.log('[Client State]', state)
        if (state === 'UNPAIRED') client.forceRefocus()
        if (state === 'CONFLICT') client.forceRefocus()
    })

     client.onGlobalParicipantsChanged((async (heuh) => {
            await welcome(client, heuh)
            //left(client, heuh)
            }))

     client.onAddedToGroup(((chat) => {
            let totalMem = chat.groupMetadata.participants.length
            if (totalMem < 10) { 
            	client.sendText(chat.id, `Cih member nya cuma ${totalMem}, Kalo mau invite bot, minimal jumlah mem harus ada 10, Paham Kan Daling`).then(() => client.leaveGroup(chat.id)).then(() => client.deleteChat(chat.id))
            } else {
                client.sendText(chat.groupMetadata.id, `Halo warga grup *${chat.contact.name}* terimakasih sudah menginvite *ZeroTwo BOT*  ini, untuk melihat menu silahkan kirim *$menu*`)
            }
        }))

     // listening on Incoming Call
        client.onIncomingCall(( async (call) => {
            await client.sendText(call.peerJid, 'Maaf, saya tidak bisa menerima panggilan. nelfon = block!')
            .then(() => client.contactBlock(call.peerJid))
        }))

    // Set all received message to seen
    client.onAck((x => {
        const { to } = x
        if (x !== 3) client.sendSeen(to)
    }))

    // Listening on message
    client.onMessage((message) => {
        client.getAmountOfLoadedMessages() // Cut message cache if it reach more than 3K
            .then((msg) => {
                if (msg >= 3000) {
                    console.log('[CLIENT]', color(`Loaded message reach ${msg}, cuting message cache...`, 'yellow'))
                    client.cutMsgCache()
                }
            })
        msgHandler(client, message) // Message handler
    })
}

// Creating Slavyan.data.json
create('Slavyan', options(true, start)) // Change your session name here
    .then((client) => start(client))
    .catch((err) => new Error(err))
