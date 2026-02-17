require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize, User, SellerProfile, SellerAddress,
  CourierProfile, Order, OrderItem, Transaction, Review,
} = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const force = process.argv.includes('--force');
    if (force) {
      console.log('Force mode: dropping and recreating all tables...');
      await sequelize.sync({ force: true });
      console.log('Tables recreated.');
    } else {
      await sequelize.sync({ alter: true });
      console.log('Tables synced (alter).');
    }

    const existing = await User.count();
    if (existing > 0 && !force) {
      console.log(`Database already has ${existing} users. Use --force to reset and reseed.`);
      process.exit(0);
    }

    const hash = await bcrypt.hash('123456', 10);

    // ============================================================
    // 1. SELLERS (Продавцы)
    // ============================================================
    console.log('Creating sellers...');

    const seller1 = await User.create({
      phone: '985999999',
      password_hash: hash,
      role: 'seller',
      first_name: 'Фирдавс',
      last_name: 'Каримов',
      birth_date: '1990-05-15',
      status: 'active',
      balance: 5000.00,
      rating: 4.8,
    });
    const sp1 = await SellerProfile.create({ user_id: seller1.id });
    const addr1 = await SellerAddress.create({
      seller_id: sp1.id,
      address_text: 'ул. Рудаки 45, Душанбе',
      latitude: 38.5598,
      longitude: 68.7740,
      is_default: true,
    });
    await SellerAddress.create({
      seller_id: sp1.id,
      address_text: 'Микрорайон 82, Душанбе',
      latitude: 38.5430,
      longitude: 68.8100,
      is_default: false,
    });

    const seller2 = await User.create({
      phone: '988888888',
      password_hash: hash,
      role: 'seller',
      first_name: 'Мадина',
      last_name: 'Рахимова',
      birth_date: '1988-11-22',
      status: 'active',
      balance: 12500.50,
      rating: 4.9,
    });
    const sp2 = await SellerProfile.create({ user_id: seller2.id });
    const addr2 = await SellerAddress.create({
      seller_id: sp2.id,
      address_text: 'пр. Исмоили Сомони 14, Душанбе',
      latitude: 38.5769,
      longitude: 68.7600,
      is_default: true,
    });

    const seller3 = await User.create({
      phone: '933333333',
      password_hash: hash,
      role: 'seller',
      first_name: 'Сорбон',
      last_name: 'Назаров',
      birth_date: '1995-03-10',
      status: 'active',
      balance: 800.00,
      rating: 4.5,
    });
    const sp3 = await SellerProfile.create({ user_id: seller3.id });
    const addr3 = await SellerAddress.create({
      seller_id: sp3.id,
      address_text: 'ул. Мирзо Турсунзаде 30, Душанбе',
      latitude: 38.5550,
      longitude: 68.7850,
      is_default: true,
    });

    console.log(`  Created ${3} sellers`);

    // ============================================================
    // 2. COURIERS (Курьеры)
    // ============================================================
    console.log('Creating couriers...');

    const courier1 = await User.create({
      phone: '955555555',
      password_hash: hash,
      role: 'courier',
      first_name: 'Далер',
      last_name: 'Шарипов',
      birth_date: '1997-07-20',
      status: 'active',
      balance: 3200.00,
      rating: 4.7,
    });
    await CourierProfile.create({
      user_id: courier1.id,
      inn: '0123456789',
      passport_front_url: '/uploads/test/passport_front_1.jpg',
      passport_back_url: '/uploads/test/passport_back_1.jpg',
      selfie_with_passport_url: '/uploads/test/selfie_1.jpg',
      transport_type: 'car',
      rating_score: 75,
      late_count: 1,
      cancel_count: 0,
    });

    const courier2 = await User.create({
      phone: '977777777',
      password_hash: hash,
      role: 'courier',
      first_name: 'Рустам',
      last_name: 'Холов',
      birth_date: '1999-01-05',
      status: 'active',
      balance: 1500.00,
      rating: 4.3,
    });
    await CourierProfile.create({
      user_id: courier2.id,
      inn: '9876543210',
      passport_front_url: '/uploads/test/passport_front_2.jpg',
      passport_back_url: '/uploads/test/passport_back_2.jpg',
      selfie_with_passport_url: '/uploads/test/selfie_2.jpg',
      transport_type: 'moto',
      rating_score: 60,
      late_count: 3,
      cancel_count: 1,
    });

    const courier3 = await User.create({
      phone: '900000000',
      password_hash: hash,
      role: 'courier',
      first_name: 'Шахноза',
      last_name: 'Мирзоева',
      birth_date: '2000-09-18',
      status: 'active',
      balance: 450.00,
      rating: 5.0,
    });
    await CourierProfile.create({
      user_id: courier3.id,
      inn: '1122334455',
      passport_front_url: '/uploads/test/passport_front_3.jpg',
      passport_back_url: '/uploads/test/passport_back_3.jpg',
      selfie_with_passport_url: '/uploads/test/selfie_3.jpg',
      transport_type: 'bicycle',
      rating_score: 90,
      late_count: 0,
      cancel_count: 0,
    });

    const courier4 = await User.create({
      phone: '999999999',
      password_hash: hash,
      role: 'courier',
      first_name: 'Бахром',
      last_name: 'Саидов',
      birth_date: '1996-04-12',
      status: 'pending',
      balance: 0,
      rating: 5.0,
    });
    await CourierProfile.create({
      user_id: courier4.id,
      inn: '5566778899',
      passport_front_url: '/uploads/test/passport_front_4.jpg',
      passport_back_url: '/uploads/test/passport_back_4.jpg',
      selfie_with_passport_url: '/uploads/test/selfie_4.jpg',
      transport_type: 'foot',
      rating_score: 50,
      late_count: 0,
      cancel_count: 0,
    });

    const courier5 = await User.create({
      phone: '985555555',
      password_hash: hash,
      role: 'courier',
      first_name: 'Камол',
      last_name: 'Зоиров',
      birth_date: '1993-12-01',
      status: 'blocked',
      balance: 200.00,
      rating: 2.1,
    });
    await CourierProfile.create({
      user_id: courier5.id,
      inn: '6677889900',
      passport_front_url: '/uploads/test/passport_front_5.jpg',
      passport_back_url: '/uploads/test/passport_back_5.jpg',
      selfie_with_passport_url: '/uploads/test/selfie_5.jpg',
      transport_type: 'car',
      rating_score: 10,
      late_count: 12,
      cancel_count: 8,
    });

    console.log(`  Created ${5} couriers (3 active, 1 pending, 1 blocked)`);

    // ============================================================
    // 3. ORDERS (Заказы)
    // ============================================================
    console.log('Creating orders...');

    // Завершённый заказ
    const order1 = await Order.create({
      seller_id: seller1.id,
      courier_id: courier1.id,
      seller_address_id: addr1.id,
      status: 'completed',
      delivery_cost: 25.00,
      commission: 5.00,
    });
    await OrderItem.bulkCreate([
      { order_id: order1.id, description: 'Плов 1 порция', delivery_address: 'ул. Айни 10, кв. 5', latitude: 38.5650, longitude: 68.7800, is_delivered: true },
      { order_id: order1.id, description: 'Лепёшка 2 шт', delivery_address: 'ул. Айни 10, кв. 5', latitude: 38.5650, longitude: 68.7800, is_delivered: true },
    ]);

    // Активный заказ — курьер едет к магазину
    const order2 = await Order.create({
      seller_id: seller2.id,
      courier_id: courier2.id,
      seller_address_id: addr2.id,
      status: 'on_way_shop',
      delivery_cost: 35.00,
      commission: 5.00,
      timer_expires_at: new Date(Date.now() + 60 * 60 * 1000),
    });
    await OrderItem.bulkCreate([
      { order_id: order2.id, description: 'Самбуса 5 шт', delivery_address: 'пр. Дружбы Народов 47, кв. 12', latitude: 38.5700, longitude: 68.7650, is_delivered: false },
    ]);

    // Ожидает курьера
    const order3 = await Order.create({
      seller_id: seller1.id,
      courier_id: null,
      seller_address_id: addr1.id,
      status: 'waiting',
      delivery_cost: 20.00,
      commission: 5.00,
    });
    await OrderItem.bulkCreate([
      { order_id: order3.id, description: 'Пицца Маргарита', delivery_address: 'ул. Бохтар 21', latitude: 38.5480, longitude: 68.7720, is_delivered: false },
      { order_id: order3.id, description: 'Coca-Cola 1.5л', delivery_address: 'ул. Бохтар 21', latitude: 38.5480, longitude: 68.7720, is_delivered: false },
      { order_id: order3.id, description: 'Картошка фри', delivery_address: 'ул. Бохтар 21', latitude: 38.5480, longitude: 68.7720, is_delivered: false },
    ]);

    // Доставлено, ждёт подтверждения
    const order4 = await Order.create({
      seller_id: seller3.id,
      courier_id: courier3.id,
      seller_address_id: addr3.id,
      status: 'delivered',
      delivery_cost: 15.00,
      commission: 5.00,
      confirm_expires_at: new Date(Date.now() + 15 * 60 * 1000),
    });
    await OrderItem.bulkCreate([
      { order_id: order4.id, description: 'Букет роз', delivery_address: 'ул. Шотемур 5', latitude: 38.5520, longitude: 68.7900, is_delivered: true },
    ]);

    // Отменён продавцом
    const order5 = await Order.create({
      seller_id: seller1.id,
      courier_id: courier1.id,
      seller_address_id: addr1.id,
      status: 'cancelled_seller',
      delivery_cost: 30.00,
      commission: 5.00,
      cancel_reason: 'Товар закончился на складе',
    });
    await OrderItem.bulkCreate([
      { order_id: order5.id, description: 'Манты 10 шт', delivery_address: 'ул. Лахути 8', latitude: 38.5610, longitude: 68.7680, is_delivered: false },
    ]);

    // Только что создан
    const order6 = await Order.create({
      seller_id: seller2.id,
      courier_id: null,
      seller_address_id: addr2.id,
      status: 'created',
      delivery_cost: 40.00,
      commission: 5.00,
    });
    await OrderItem.bulkCreate([
      { order_id: order6.id, description: 'Телефон Samsung A54', delivery_address: 'ул. Нисор Мухаммад 15', latitude: 38.5750, longitude: 68.8000, is_delivered: false },
    ]);

    // Принят курьером
    const order7 = await Order.create({
      seller_id: seller3.id,
      courier_id: courier1.id,
      seller_address_id: addr3.id,
      status: 'accepted',
      delivery_cost: 22.00,
      commission: 5.00,
      timer_expires_at: new Date(Date.now() + 85 * 60 * 1000),
    });
    await OrderItem.bulkCreate([
      { order_id: order7.id, description: 'Документы (папка)', delivery_address: 'пр. Сино 33', latitude: 38.5600, longitude: 68.8050, is_delivered: false },
      { order_id: order7.id, description: 'Флешка USB 64GB', delivery_address: 'пр. Сино 33', latitude: 38.5600, longitude: 68.8050, is_delivered: false },
    ]);

    // Курьер у магазина
    const order8 = await Order.create({
      seller_id: seller1.id,
      courier_id: courier3.id,
      seller_address_id: addr1.id,
      status: 'at_shop',
      delivery_cost: 18.00,
      commission: 5.00,
      timer_expires_at: new Date(Date.now() + 70 * 60 * 1000),
    });
    await OrderItem.bulkCreate([
      { order_id: order8.id, description: 'Торт 1кг', delivery_address: 'ул. Гулистон 7', latitude: 38.5560, longitude: 68.7760, is_delivered: false },
    ]);

    // Истёкший
    const order9 = await Order.create({
      seller_id: seller2.id,
      courier_id: courier2.id,
      seller_address_id: addr2.id,
      status: 'expired',
      delivery_cost: 50.00,
      commission: 5.00,
    });
    await OrderItem.bulkCreate([
      { order_id: order9.id, description: 'Крупный заказ из магазина', delivery_address: 'ул. Дехоти 20', latitude: 38.5400, longitude: 68.7500, is_delivered: false },
    ]);

    // Ещё один завершённый
    const order10 = await Order.create({
      seller_id: seller3.id,
      courier_id: courier1.id,
      seller_address_id: addr3.id,
      status: 'completed',
      delivery_cost: 28.00,
      commission: 5.00,
    });
    await OrderItem.bulkCreate([
      { order_id: order10.id, description: 'Лекарства из аптеки', delivery_address: 'ул. Хувайдуллоев 3', latitude: 38.5580, longitude: 68.7950, is_delivered: true },
    ]);

    console.log(`  Created ${10} orders`);

    // ============================================================
    // 4. TRANSACTIONS (Транзакции)
    // ============================================================
    console.log('Creating transactions...');

    const txData = [
      // Seller1 пополнения
      { user_id: seller1.id, order_id: null, type: 'deposit', amount: 5000.00, description: 'Пополнение баланса через Alif Mobi' },
      // Заказ 1 — цикл транзакций
      { user_id: seller1.id, order_id: order1.id, type: 'freeze', amount: -25.00, description: 'Заморозка средств за заказ #1' },
      { user_id: seller1.id, order_id: order1.id, type: 'payment', amount: -25.00, description: 'Оплата доставки заказ #1' },
      { user_id: courier1.id, order_id: order1.id, type: 'payment', amount: 20.00, description: 'Оплата за доставку заказ #1 (минус комиссия)' },
      { user_id: seller1.id, order_id: order1.id, type: 'commission', amount: -5.00, description: 'Комиссия сервиса заказ #1' },
      // Seller2 пополнения
      { user_id: seller2.id, order_id: null, type: 'deposit', amount: 10000.00, description: 'Пополнение баланса' },
      { user_id: seller2.id, order_id: null, type: 'deposit', amount: 3000.00, description: 'Пополнение баланса через Dushanbe City' },
      // Seller2 заморозка за заказ 2
      { user_id: seller2.id, order_id: order2.id, type: 'freeze', amount: -35.00, description: 'Заморозка средств за заказ #2' },
      // Courier1 вывод
      { user_id: courier1.id, order_id: null, type: 'deposit', amount: 3500.00, description: 'Начальное пополнение' },
      { user_id: courier1.id, order_id: null, type: 'withdrawal', amount: -300.00, description: 'Вывод на карту' },
      // Seller3
      { user_id: seller3.id, order_id: null, type: 'deposit', amount: 1000.00, description: 'Пополнение' },
      { user_id: seller3.id, order_id: order4.id, type: 'freeze', amount: -15.00, description: 'Заморозка за заказ #4' },
      // Courier3
      { user_id: courier3.id, order_id: null, type: 'deposit', amount: 500.00, description: 'Пополнение' },
      // Штраф за отмену заказа 5
      { user_id: seller1.id, order_id: order5.id, type: 'freeze', amount: -30.00, description: 'Заморозка за заказ #5' },
      { user_id: seller1.id, order_id: order5.id, type: 'unfreeze', amount: 15.00, description: 'Частичный возврат (штраф 50%)' },
      // Заказ 10
      { user_id: seller3.id, order_id: order10.id, type: 'payment', amount: -28.00, description: 'Оплата доставки заказ #10' },
      { user_id: courier1.id, order_id: order10.id, type: 'payment', amount: 23.00, description: 'Оплата за доставку заказ #10' },
      { user_id: seller3.id, order_id: order10.id, type: 'commission', amount: -5.00, description: 'Комиссия сервиса заказ #10' },
    ];

    await Transaction.bulkCreate(txData);
    console.log(`  Created ${txData.length} transactions`);

    // ============================================================
    // 5. REVIEWS (Отзывы)
    // ============================================================
    console.log('Creating reviews...');

    const reviewData = [
      { order_id: order1.id, reviewer_id: seller1.id, target_id: courier1.id, stars: 5, comment: 'Отличная доставка, быстро и аккуратно!' },
      { order_id: order1.id, reviewer_id: courier1.id, target_id: seller1.id, stars: 5, comment: 'Заказ был готов вовремя, спасибо!' },
      { order_id: order10.id, reviewer_id: seller3.id, target_id: courier1.id, stars: 4, comment: 'Хорошо, но немного задержался' },
      { order_id: order10.id, reviewer_id: courier1.id, target_id: seller3.id, stars: 5, comment: 'Всё отлично' },
    ];

    await Review.bulkCreate(reviewData);
    console.log(`  Created ${reviewData.length} reviews`);

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n========================================');
    console.log('  SEED COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('\nТестовые аккаунты (пароль для всех: 123456):');
    console.log('');
    console.log('  ПРОДАВЦЫ:');
    console.log('  985999999  Фирдавс Каримов    (баланс: 5000, рейтинг: 4.8)');
    console.log('  988888888  Мадина Рахимова     (баланс: 12500, рейтинг: 4.9)');
    console.log('  933333333  Сорбон Назаров      (баланс: 800, рейтинг: 4.5)');
    console.log('');
    console.log('  КУРЬЕРЫ:');
    console.log('  955555555  Далер Шарипов       (active, car, рейтинг: 4.7)');
    console.log('  977777777  Рустам Холов        (active, moto, рейтинг: 4.3)');
    console.log('  900000000  Шахноза Мирзоева    (active, bicycle, рейтинг: 5.0)');
    console.log('  999999999  Бахром Саидов       (pending — ждёт модерации)');
    console.log('  985555555  Камол Зоиров        (blocked, рейтинг: 2.1)');
    console.log('');
    console.log('  ЗАКАЗЫ: 10 шт (completed: 2, active: 4, cancelled: 1, expired: 1, waiting: 1, created: 1)');
    console.log('  ТРАНЗАКЦИИ: 18 шт');
    console.log('  ОТЗЫВЫ: 4 шт');
    console.log('');
    console.log('  SMS-код для верификации (заглушка): 1234');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
