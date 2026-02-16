const redis = require('../config/redis');
const COURIER_GEO_KEY = 'courier:locations';
const COURIER_ONLINE_PREFIX = 'courier:online:';

class GeoService {
  async updateCourierLocation(courierId, latitude, longitude) {
    await redis.geoadd(COURIER_GEO_KEY, longitude, latitude, String(courierId));
    await redis.set(`${COURIER_ONLINE_PREFIX}${courierId}`, JSON.stringify({ latitude, longitude, updatedAt: new Date().toISOString() }), 'EX', 120);
  }

  async findCouriersNearby(latitude, longitude, radiusKm = 3) {
    const results = await redis.georadius(COURIER_GEO_KEY, longitude, latitude, radiusKm, 'km', 'WITHCOORD', 'WITHDIST', 'ASC', 'COUNT', 50);
    const couriers = [];
    for (const [courierId, distance, coords] of results) {
      const isOnline = await redis.exists(`${COURIER_ONLINE_PREFIX}${courierId}`);
      if (isOnline) couriers.push({ courierId: parseInt(courierId), distance: parseFloat(distance), longitude: parseFloat(coords[0]), latitude: parseFloat(coords[1]) });
    }
    return couriers;
  }

  async getCourierLocation(courierId) {
    const data = await redis.get(`${COURIER_ONLINE_PREFIX}${courierId}`);
    return data ? JSON.parse(data) : null;
  }

  async removeCourier(courierId) {
    await redis.zrem(COURIER_GEO_KEY, String(courierId));
    await redis.del(`${COURIER_ONLINE_PREFIX}${courierId}`);
  }
}

module.exports = new GeoService();
