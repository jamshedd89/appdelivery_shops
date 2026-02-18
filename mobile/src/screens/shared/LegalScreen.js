import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../utils/constants';

const LEGAL_CONTENT = {
  terms: {
    title: 'Пользовательское соглашение',
    sections: [
      {
        heading: '1. Общие положения',
        text: 'Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между сервисом «AppDelivery» (далее — Сервис) и лицом, использующим Сервис (далее — Пользователь). Используя Сервис, Пользователь подтверждает своё согласие с условиями настоящего Соглашения.',
      },
      {
        heading: '2. Предмет соглашения',
        text: 'Сервис предоставляет платформу для организации доставки товаров между продавцами и курьерами. Сервис является посредником и не несёт ответственности за качество доставляемых товаров.',
      },
      {
        heading: '3. Права и обязанности сторон',
        text: 'Пользователь обязуется: предоставлять достоверные данные при регистрации; не нарушать правила использования Сервиса; своевременно оплачивать услуги доставки.\n\nСервис обязуется: обеспечивать доступность платформы; защищать персональные данные Пользователей; обрабатывать жалобы и обращения.',
      },
      {
        heading: '4. Финансовые условия',
        text: 'Комиссия сервиса: 5 сомони с каждого заказа. Минимальная стоимость доставки: 10 сомони. Минимальная сумма вывода: 50 сомони. Комиссия за вывод: до 100 сом — 3%, свыше 100 сом — 1.5%.',
      },
      {
        heading: '5. Наличные расчёты',
        text: 'Курьер не имеет права принимать наличные средства от клиентов. Все расчёты по стоимости товара осуществляются между продавцом и покупателем напрямую. Сервис не несёт ответственности за денежные потери между участниками.',
      },
      {
        heading: '6. Ответственность',
        text: 'Сервис не несёт ответственности за: качество доставляемых товаров; действия или бездействие Пользователей; убытки, возникшие в результате нарушения Пользователем условий Соглашения.',
      },
      {
        heading: '7. Изменение условий',
        text: 'Сервис вправе изменять условия настоящего Соглашения. Продолжение использования Сервиса после внесения изменений означает согласие с новыми условиями.',
      },
    ],
  },
  privacy: {
    title: 'Политика конфиденциальности',
    sections: [
      {
        heading: '1. Сбор данных',
        text: 'Мы собираем следующие данные: номер телефона, имя и фамилия, дата рождения, фотографии документов (для курьеров), данные геолокации, история заказов и транзакций.',
      },
      {
        heading: '2. Использование данных',
        text: 'Данные используются для: обеспечения работы Сервиса, верификации пользователей, обработки платежей, улучшения качества Сервиса, связи с пользователями.',
      },
      {
        heading: '3. Геолокация',
        text: 'Сервис использует данные геолокации для: отображения местоположения курьеров в реальном времени, поиска ближайших курьеров, расчёта маршрутов доставки. Обновление координат происходит каждые 15-30 секунд.',
      },
      {
        heading: '4. Защита данных',
        text: 'Мы принимаем все необходимые меры для защиты персональных данных: шифрование данных при передаче (SSL/TLS), хранение паролей в хэшированном виде, ограничение доступа к данным.',
      },
      {
        heading: '5. Передача данных третьим лицам',
        text: 'Мы не передаём персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством.',
      },
      {
        heading: '6. Удаление данных',
        text: 'Пользователь имеет право запросить удаление своих данных. Для этого необходимо обратиться в службу поддержки.',
      },
    ],
  },
  dataProcessing: {
    title: 'Согласие на обработку данных',
    sections: [
      {
        heading: '1. Согласие',
        text: 'Регистрируясь в Сервисе, Пользователь даёт согласие на обработку своих персональных данных в соответствии с настоящим документом и Политикой конфиденциальности.',
      },
      {
        heading: '2. Перечень данных',
        text: 'Обрабатываемые данные: ФИО, номер телефона, дата рождения, адрес, ИНН (для курьеров), фото документов, геолокация, данные о заказах и транзакциях.',
      },
      {
        heading: '3. Цели обработки',
        text: 'Данные обрабатываются для: исполнения пользовательского соглашения, обеспечения безопасности, модерации, финансовых операций, аналитики и улучшения Сервиса.',
      },
      {
        heading: '4. Срок хранения',
        text: 'Данные хранятся в течение всего периода использования Сервиса и 3 года после удаления аккаунта.',
      },
      {
        heading: '5. Отзыв согласия',
        text: 'Пользователь вправе отозвать согласие на обработку персональных данных, направив запрос в службу поддержки. Отзыв согласия влечёт за собой удаление аккаунта.',
      },
    ],
  },
};

export default function LegalScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const type = route.params?.type || 'terms';
  const content = LEGAL_CONTENT[type] || LEGAL_CONTENT.terms;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{content.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {content.sections.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionText}>{section.text}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingVertical: 14, gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  sectionText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  footer: {
    fontSize: 12, color: COLORS.textMuted, textAlign: 'center',
    marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
});
