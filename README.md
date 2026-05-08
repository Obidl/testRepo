# Panda Burger MVP

Kichik kafelar uchun mo'ljallangan "Aqlli QR-Menyu" tizimi.

## Xususiyatlari
- **Mijoz qismi**: Taomlar ro'yxati, savatcha, Telegram orqali buyurtma berish.
- **Admin qismi**: Menyuni tahrirlash (qo'shish/o'chirish).
- **Responsive**: Mobil qurilmalar uchun optimallashgan zamonaviy dizayn.
- **Telegram Integratsiya**: Buyurtmalar to'g'ridan-to'g'ri Telegram botga boradi.

## O'rnatish va Ishga tushirish

1. **Zaruriy paketlarni o'rnating**:
   ```bash
   npm install
   ```

2. **Telegram Botni sozlang**:
   `src/App.jsx` faylini oching va quyidagi o'zgaruvchilarga o'z ma'lumotlaringizni kiriting:
   - `TELEGRAM_BOT_TOKEN`: BotFather orqali olingan token.
   - `TELEGRAM_CHAT_ID`: Buyurtmalar borishi kerak bo'lgan guruh yoki user IDsi.

## Deploy qilish (Vercel orqali)

Loyiha tayyor bo'lgach, uni dunyo ko'rishi uchun bepul **Vercel** xizmatiga joylash mumkin:

1. [Vercel](https://vercel.com/) sahifasida ro'yxatdan o'ting.
2. GitHub repositoriyangizni ulang.
3. `Framework Preset` sifatida **Vite** tanlanganiga ishonch hosil qiling.
4. `Deploy` tugmasini bosing.

Vercel sizga `https://panda-burger.vercel.app` kabi URL beradi. Stol raqami bilan ishlatish uchun: `https://panda-burger.vercel.app/?table=1`

## Test qilish
- **Bot Sozlamalari**: Buyurtmalar Telegramga borishi uchun `src/App.jsx` ichida `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` ni o'rnatish shart.
- **Admin**: Yuqori o'ng burchakdagi sozlamalar belgisi. Parol: `admin`.

## Muhim
MVP versiyada ma'lumotlar `localStorage` da saqlanadi. Agar keshni tozalab yuborsangiz, menyu boshlang'ich holatiga qaytadi. To'liq saqlash uchun kelajakda Firebase yoki MongoDB kabi ma'lumotlar omborini ulash tavsiya etiladi.

