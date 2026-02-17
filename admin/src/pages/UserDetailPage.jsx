import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Star, Wallet, Shield, Clock, AlertTriangle, MapPin, Car, FileText, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../services/api';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  limited: 'bg-orange-100 text-orange-700',
  blocked: 'bg-red-100 text-red-700',
};
const STATUS_LABELS = {
  active: 'Активен', pending: 'На модерации', limited: 'Ограничен', blocked: 'Заблокирован',
};
const TRANSPORT_LABELS = {
  foot: 'Пешком', bicycle: 'Велосипед', moto: 'Мотоцикл', car: 'Автомобиль',
};

export default function UserDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await adminApi.getUserById(id);
      setUser(data.data);
    } catch {
      alert('Пользователь не найден');
      nav('/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const changeStatus = async (status) => {
    if (!confirm(`Изменить статус на "${STATUS_LABELS[status]}"?`)) return;
    try {
      await adminApi.updateUserStatus(id, status);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Ошибка');
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

  if (!user) return null;

  const isCourier = user.role === 'courier';
  const cp = user.courierProfile;
  const sp = user.sellerProfile;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <button onClick={() => nav('/users')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 bg-transparent border-none cursor-pointer text-sm font-medium transition-colors">
        <ArrowLeft size={18} /> Назад к пользователям
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-dark">{user.first_name} {user.last_name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`badge ${isCourier ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
              {isCourier ? 'Курьер' : 'Продавец'}
            </span>
            <span className={`badge ${STATUS_COLORS[user.status]}`}>{STATUS_LABELS[user.status]}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {user.status !== 'active' && (
            <button onClick={() => changeStatus('active')} className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-green-600 transition-colors">
              <CheckCircle size={16} /> Активировать
            </button>
          )}
          {user.status !== 'blocked' && (
            <button onClick={() => changeStatus('blocked')} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-red-600 transition-colors">
              <XCircle size={16} /> Заблокировать
            </button>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Basic info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
            <User size={18} className="text-primary-500" /> Основная информация
          </h3>
          <div className="space-y-3">
            <InfoRow icon={Phone} label="Телефон" value={user.phone} />
            <InfoRow icon={Star} label="Рейтинг" value={`${user.rating?.toFixed(1)} / 5.0`} />
            <InfoRow icon={Wallet} label="Баланс" value={`${parseFloat(user.balance).toFixed(2)} сом`} />
            <InfoRow icon={Wallet} label="Заморожено" value={`${parseFloat(user.frozen_balance).toFixed(2)} сом`} />
            <InfoRow icon={Clock} label="Дата рождения" value={user.birth_date || '—'} />
            <InfoRow icon={Clock} label="Регистрация" value={new Date(user.createdAt || user.created_at).toLocaleString()} />
          </div>
        </div>

        {/* Role-specific info */}
        {isCourier && cp && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
              <Shield size={18} className="text-primary-500" /> Данные курьера
            </h3>
            <div className="space-y-3">
              <InfoRow icon={Car} label="Транспорт" value={TRANSPORT_LABELS[cp.transport_type] || cp.transport_type} />
              <InfoRow icon={FileText} label="ИНН" value={cp.inn} />
              <InfoRow icon={Star} label="Рейтинг-скор" value={`${cp.rating_score} / 100`} />
              <InfoRow icon={AlertTriangle} label="Опозданий" value={cp.late_count} highlight={cp.late_count >= 3} />
              <InfoRow icon={AlertTriangle} label="Отмен (всего)" value={cp.cancel_count} />
              <InfoRow icon={AlertTriangle} label="Отмен подряд" value={cp.consecutive_cancels} highlight={cp.consecutive_cancels >= 3} />
              <InfoRow icon={MapPin} label="Радиус поиска" value={`${cp.search_radius_km} км`} />
            </div>
          </div>
        )}

        {!isCourier && sp && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary-500" /> Адреса магазинов
            </h3>
            {sp.addresses?.length > 0 ? (
              <div className="space-y-3">
                {sp.addresses.map((a, i) => (
                  <div key={a.id || i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin size={16} className="text-primary-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-dark">{a.address_text}</div>
                      <div className="text-xs text-gray-400 mt-1">{a.latitude}, {a.longitude}</div>
                      {a.is_default && <span className="badge bg-primary-500/10 text-primary-500 mt-1">По умолчанию</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Нет адресов</p>
            )}
            {user.extra_commission_rate > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-xl">
                <div className="text-sm font-semibold text-red-600">Повышенная комиссия: +{(user.extra_commission_rate * 100).toFixed(0)}%</div>
                <div className="text-xs text-red-400 mt-1">За частые отмены заказов</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Courier documents */}
      {isCourier && cp && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
            <FileText size={18} className="text-primary-500" /> Документы курьера
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DocCard label="Паспорт (лицевая)" url={cp.passport_front_url} />
            <DocCard label="Паспорт (обратная)" url={cp.passport_back_url} />
            <DocCard label="Фото с паспортом" url={cp.selfie_with_passport_url} />
          </div>
          {user.status === 'pending' && (
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => changeStatus('active')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-green-600 transition-colors">
                <CheckCircle size={18} /> Одобрить и активировать
              </button>
              <button onClick={() => changeStatus('blocked')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-red-600 transition-colors">
                <XCircle size={18} /> Отклонить
              </button>
            </div>
          )}
        </div>
      )}

      {/* Blocked info */}
      {user.blocked_until && (
        <div className="bg-red-50 rounded-2xl p-5 border border-red-200 mb-6">
          <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
            <AlertTriangle size={18} />
            Заблокирован до: {new Date(user.blocked_until).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 text-gray-500 text-sm">
        <Icon size={15} /> {label}
      </div>
      <span className={`text-sm font-semibold ${highlight ? 'text-red-600' : 'text-dark'}`}>{value}</span>
    </div>
  );
}

function DocCard({ label, url }) {
  const isStub = !url || url.includes('stub');
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        {isStub ? (
          <div className="text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-xs">Не загружено</div>
          </div>
        ) : (
          <img src={url} alt={label} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50">{label}</div>
    </div>
  );
}
