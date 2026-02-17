import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, User, Truck, Clock, MessageCircle, DollarSign, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { adminApi } from '../services/api';

const STATUS_LABELS = {
  created: 'Создана', waiting: 'Ожидает курьера', accepted: 'Принята курьером',
  on_way_shop: 'Курьер в пути к магазину', at_shop: 'Курьер на месте',
  on_way_client: 'В пути к клиенту', delivered: 'Доставлено',
  confirmed: 'Подтверждено продавцом', completed: 'Завершено',
  cancelled_seller: 'Отменено продавцом', cancelled_courier: 'Отменено курьером', expired: 'Истёк таймер',
};
const STATUS_COLORS = {
  completed: 'bg-green-500', confirmed: 'bg-green-500', delivered: 'bg-blue-500',
  cancelled_seller: 'bg-red-500', cancelled_courier: 'bg-red-500', expired: 'bg-red-500',
  waiting: 'bg-amber-500', accepted: 'bg-blue-400', created: 'bg-gray-400',
  on_way_shop: 'bg-blue-400', at_shop: 'bg-indigo-500', on_way_client: 'bg-violet-500',
};
const TRANSPORT_LABELS = { foot: 'Пешком', bicycle: 'Велосипед', moto: 'Мотоцикл', car: 'Автомобиль' };

const STATUS_FLOW = ['created', 'waiting', 'accepted', 'on_way_shop', 'at_shop', 'on_way_client', 'delivered', 'confirmed', 'completed'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminApi.getOrderById(id);
        setOrder(data.data);
      } catch {
        alert('Заказ не найден');
        nav('/orders');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const loadMessages = async () => {
    try {
      const { data } = await adminApi.getOrderMessages(id);
      setMessages(data.data);
      setShowChat(true);
    } catch {
      alert('Ошибка загрузки сообщений');
    }
  };

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
  if (!order) return null;

  const currentStep = STATUS_FLOW.indexOf(order.status);
  const isCancelled = ['cancelled_seller', 'cancelled_courier', 'expired'].includes(order.status);

  return (
    <div className="p-8 max-w-5xl">
      <button onClick={() => nav('/orders')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 bg-transparent border-none cursor-pointer text-sm font-medium transition-colors">
        <ArrowLeft size={18} /> Назад к заказам
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-dark">Заказ #{order.id}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`badge text-white ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(order.createdAt || order.created_at).toLocaleString()}
            </span>
          </div>
        </div>
        <button onClick={loadMessages} className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-primary-500/90 transition-colors">
          <MessageCircle size={16} /> Чат ({messages.length || '...'})
        </button>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
          <h3 className="text-sm font-bold text-dark mb-4">Прогресс заказа</h3>
          <div className="flex items-center gap-1">
            {STATUS_FLOW.map((s, i) => {
              const done = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={s} className="flex-1 flex flex-col items-center">
                  <div className={`w-full h-2 rounded-full ${done ? 'bg-green-500' : 'bg-gray-200'} ${isCurrent ? 'ring-2 ring-green-300' : ''}`} />
                  <span className={`text-[10px] mt-1.5 text-center leading-tight ${done ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
                    {STATUS_LABELS[s]?.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancel info */}
      {isCancelled && order.cancel_reason && (
        <div className="bg-red-50 rounded-2xl p-5 border border-red-200 mb-4">
          <div className="flex items-center gap-2 text-red-600 font-semibold text-sm mb-1">
            <AlertTriangle size={16} /> Причина отмены
          </div>
          <p className="text-sm text-red-600/80">{order.cancel_reason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Finance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-dark mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-primary-500" /> Финансы
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Доставка</span><span className="font-bold text-dark">{order.delivery_cost} сом</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Комиссия</span><span className="font-bold text-dark">{order.commission} сом</span></div>
            <div className="flex justify-between text-sm border-t border-gray-100 pt-3"><span className="text-gray-500 font-semibold">Итого заморожено</span><span className="font-bold text-primary-500">{(parseFloat(order.delivery_cost) + parseFloat(order.commission)).toFixed(2)} сом</span></div>
          </div>
          {order.timer_expires_at && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl text-sm">
              <Clock size={14} className="inline text-amber-600 mr-1" />
              <span className="text-amber-700 font-medium">Таймер: {new Date(order.timer_expires_at).toLocaleString()}</span>
            </div>
          )}
          {order.confirm_expires_at && (
            <div className="mt-2 p-3 bg-blue-50 rounded-xl text-sm">
              <CheckCircle size={14} className="inline text-blue-600 mr-1" />
              <span className="text-blue-700 font-medium">Подтверждение до: {new Date(order.confirm_expires_at).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-dark mb-4 flex items-center gap-2">
            <User size={16} className="text-primary-500" /> Участники
          </h3>
          {order.seller && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl mb-3 cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => nav(`/users/${order.seller.id}`)}>
              <div className="w-10 h-10 rounded-xl bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-sm">{order.seller.first_name[0]}</div>
              <div>
                <div className="text-sm font-semibold text-dark">{order.seller.first_name} {order.seller.last_name}</div>
                <div className="text-xs text-gray-400">Продавец | {order.seller.phone} | ★{order.seller.rating?.toFixed(1)}</div>
              </div>
            </div>
          )}
          {order.courier ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => nav(`/users/${order.courier.id}`)}>
              <div className="w-10 h-10 rounded-xl bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">{order.courier.first_name[0]}</div>
              <div>
                <div className="text-sm font-semibold text-dark">{order.courier.first_name} {order.courier.last_name}</div>
                <div className="text-xs text-gray-400">
                  Курьер | {order.courier.phone} | ★{order.courier.rating?.toFixed(1)}
                  {order.courier.courierProfile && ` | ${TRANSPORT_LABELS[order.courier.courierProfile.transport_type]}`}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 p-3">Курьер не назначен</div>
          )}
          {order.sellerAddress && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><MapPin size={14} /> Адрес магазина</div>
              <div className="text-sm font-medium text-dark">{order.sellerAddress.address_text}</div>
              <div className="text-xs text-gray-400 mt-0.5">{order.sellerAddress.latitude}, {order.sellerAddress.longitude}</div>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
        <h3 className="text-sm font-bold text-dark mb-4 flex items-center gap-2">
          <Package size={16} className="text-primary-500" /> Товары ({order.items?.length || 0})
        </h3>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-sm shrink-0">{i + 1}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-dark">{item.description}</div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                  <MapPin size={12} /> {item.delivery_address}
                </div>
                <div className="text-[11px] text-gray-300 mt-0.5">{item.latitude}, {item.longitude}</div>
              </div>
              {item.is_delivered && <CheckCircle size={18} className="text-green-500 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      {showChat && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
          <h3 className="text-sm font-bold text-dark mb-4 flex items-center gap-2">
            <MessageCircle size={16} className="text-primary-500" /> Чат ({messages.length} сообщений)
          </h3>
          {messages.length === 0 ? (
            <p className="text-sm text-gray-400">Нет сообщений</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender?.role === 'courier' ? 'justify-end' : ''}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl text-sm ${m.sender?.role === 'courier' ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>
                    <div className="text-[11px] font-semibold mb-1 opacity-60">
                      {m.sender ? `${m.sender.first_name} (${m.sender.role === 'courier' ? 'Курьер' : 'Продавец'})` : 'Неизвестный'}
                    </div>
                    {m.type === 'location' ? (
                      <div className="flex items-center gap-1"><MapPin size={14} /> {m.content}</div>
                    ) : (
                      <div>{m.content}</div>
                    )}
                    <div className="text-[10px] opacity-40 mt-1 text-right">
                      {new Date(m.createdAt || m.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
