let handler = async (m) => {
    if (text) throw "Teksnya?";

    global.db.data.chats[m.chat].sWelcome = text;
    m.reply("Berhasil");
};
handler.help = ["setbye"];
handler.tags = ["group"];
handler.command = /^setbye$/i;
handler.group = true;
handler.admin = true;

export default handler;