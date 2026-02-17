import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Clock, User, Car } from 'lucide-react';
import { adminApi } from '../services/api';

const TRANSPORT_LABELS = { foot: 'Пешком', bicycle: 'Велосипед', moto: 'Мотоцикл', car: 'Автомобиль' };

export default function ModerationPage() {
  const nav = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getUsers({ role: 'courier', status: 'pending' });
      setUsers(data.data.users);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    const label = status === 'active' ? 'одобрить' : 'отклонить';
    if (!confirm(`Вы уверены, что хотите ${label} этого курьера?`)) return;
    try {
      await adminApi.updateUserStatus(id, status);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Ошибка');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-[28px] font-bold text-dark">Модерация</h1>
        <span className="badge bg-amber-100 text-amber-700 text-base">{users.length}</span>
      </div>

      {loading && <div className="text-center text-gray-400 py-10">Загрузка...</div>}

      {!loading && users.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
          <h3 className="text-lg font-bold text-dark mb-1">Всё проверено!</h3>
          <p className="text-sm text-gray-400">Нет курьеров, ожидающих модерации</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {users.map((u) => {
          const cp = u.courierProfile;
          return (
            <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Clock size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-dark cursor-pointer hover:text-primary-500" onClick={() => nav(`/users/${u.id}`)}>
                        {u.first_name} {u.last_name}
                      </div>
                      <div className="text-sm text-gray-400">{u.phone} | Регистрация: {new Date(u.createdAt || u.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className="badge bg-amber-100 text-amber-700">На модерации</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 space-y-2 text-sm">
                {cp && (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500">Транспорт</span><span className="font-semibold">{TRANSPORT_LABELS[cp.transport_type]}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">ИНН</span><span className="font-semibold">{cp.inn}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Дата рождения</span><span className="font-semibold">{u.birth_date || '—'}</span></div>
                  </>
                )}
              </div>

              {/* Documents */}
              {cp && (
                <div className="px-5 pb-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Документы:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <DocThumb label="Паспорт (лиц.)" url={cp.passport_front_url} />
                    <DocThumb label="Паспорт (обр.)" url={cp.passport_back_url} />
                    <DocThumb label="Фото с паспортом" url={cp.selfie_with_passport_url} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 p-5 pt-3 border-t border-gray-100">
                <button onClick={() => changeStatus(u.id, 'active')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-green-600 transition-colors">
                  <CheckCircle size={16} /> Одобрить
                </button>
                <button onClick={() => changeStatus(u.id, 'blocked')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-red-600 transition-colors">
                  <XCircle size={16} /> Отклонить
                </button>
                <button onClick={() => nav(`/users/${u.id}`)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-gray-200 transition-colors">
                  Подробнее
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DocThumb({ label, url }) {
  const isStub = !url || url.includes('stub');
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="h-20 bg-gray-100 flex items-center justify-center">
        {isStub ? (
          <FileText size={20} className="text-gray-300" />
        ) : (
          <img src={url} alt={label} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="px-1.5 py-1 text-[10px] text-gray-500 text-center truncate">{label}</div>
    </div>
  );
}
