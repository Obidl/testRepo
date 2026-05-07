# Smart QR-Menu MVP

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

3. **Loyihani ishga tushiring**:
   ```bash
   npm run dev
   ```

4. **Stol raqami bilan test qilish**:
   Brauzerda quyidagi URLni oching: `http://localhost:5173/?table=5`

## Texnologiyalar
- React (Vite)
- Tailwind CSS
- Lucide Icons
- LocalStorage (Ma'lumotlar saqlash uchun)
