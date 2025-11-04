import axios from 'axios'
import { delay } from 'baileys'

let handler = async (m, { text, args }) => {
    const nominal = parseInt(text)
    if (!nominal) return m.reply('jumlahnya?')
    if (nominal < 999) return m.reply('Minimal 1k lah, pelit amat')
    if (nominal > 1000000) return m.reply('Yakin Nih??')
    const cqris = await createQris(pakasir.slug, pakasir.apikey, nominal);
    let status = "";
    const expiredAt = new Date(cqris.expired_at);
    const expiredTime = expiredAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta'
    })
    const sQris = await conn.sendMessage(m.chat, {
        image: { url: `https://quickchart.io/qr?text=${encodeURIComponent(cqris.payment_number)}` },
        caption: `Scan Qris Untuk Melakukan Pembayaran\n\nWaktu Expired : ${expiredTime} WIB\nBiaya Admin : ${cqris.fee}\nTotal Pembayaran : ${cqris.total_payment}\nOrderID : #${cqris.order_id}`
    }, { quoted: m });

    while (status !== "completed") {
        if (new Date() >= expiredAt) {
            conn.sendMessage(m.chat, { delete: sQris.key });
            m.reply("QRIS sudah expired.");
            return;
        }

        const res = await checkStatus(pakasir.slug, pakasir.apikey, cqris.order_id, nominal);
        if (res && res.status === "completed") {
            status = "completed";
            conn.sendMessage(m.chat, { delete: sQris.key });
            m.reply('Makasih Udah Donate😇');
            return;
        }

        await delay(5000);
    }

}
handler.help = ['donate']
handler.tags = ['main']
handler.command = /^(donate|donasi|traktir)$/i
export default handler

async function createQris(project, apikey, amount) {
    try {
        const res = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
            project,
            order_id: Math.random().toString(25).slice(2, 10).toUpperCase(),
            amount,
            api_key: apikey
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return res.data.payment;
    } catch (e) {
        throw e
    }
}

async function checkStatus(project, apikey, orderId, amount) {
    try {
        const res = await axios.get(`https://app.pakasir.com/api/transactiondetail?project=${project}&amount=${amount}&order_id=${orderId}&api_key=${apikey}`);
        return res.data.transaction;
    } catch (e) {
        throw e;
    }
}