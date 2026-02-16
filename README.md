# AppDelivery - Логистическая система доставки

Мобильное приложение для организации доставки товаров между продавцами и курьерами.

## Структура (монорепо)

```
backend/     - Node.js + Express + MySQL + Redis + Socket.io + BullMQ
mobile/      - React Native (Expo) мобильное приложение
admin/       - React (Vite) админ-панель
```

## Быстрый старт

### Backend
```bash
cd backend
npm install
# Настройте .env (MySQL, Redis)
npm run dev
```

### Admin Panel
```bash
cd admin
npm install
npm run dev    # http://localhost:5173
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

## API: /api/auth, /api/orders, /api/balance, /api/reviews, /api/admin

SMS-код заглушка: **1234**
