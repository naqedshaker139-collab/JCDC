import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Truck,
  Forklift,
  Construction,
  Loader,
  RollerCoaster,
  Shovel,
  ArrowBigUp,
  Gauge,
  Phone,
  ArrowLeft,
  Building,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Utilities */
/* -------------------------------------------------------------------------- */

const norm = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
};

const includesAny = (name, keywords) => {
  const n = norm(name);
  return keywords.some((k) => n.includes(k));
};

/* Safe getters for API field variants */
const getName = (eq) => (eq?.equipment_name ?? eq?.name ?? '').trim();
const getStatus = (eq) => (eq?.status ?? eq?.equipment_status ?? '').trim();
const getAsset = (eq) => (eq?.asset_no ?? eq?.assetNo ?? '').trim();
const getPlate = (eq) => (eq?.plate_serial_no ?? eq?.plateSerialNo ?? '').trim();
const getDept = (eq) => (eq?.zone_department ?? eq?.department ?? '').trim();
const getDayDriverName = (eq) => (eq?.day_shift_driver_name ?? eq?.dayDriverName ?? '').trim();
const getDayDriverPhone = (eq) => (eq?.day_shift_driver_phone ?? eq?.dayDriverPhone ?? '').trim();
const getNightDriverName = (eq) => (eq?.night_shift_driver_name ?? eq?.nightDriverName ?? '').trim();
const getNightDriverPhone = (eq) => (eq?.night_shift_driver_phone ?? eq?.nightDriverPhone ?? '').trim();

/* -------------------------------------------------------------------------- */
/* Component */
/* -------------------------------------------------------------------------- */

export default function EquipmentList() {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  /* Categories tuned to your dataset (keywords are lowercase and trimmed) */
  const categories = [
    {
      id: 'forklifts',
      name: 'Forklifts',
      nameAr: 'الرافعات الشوكية',
      icon: Forklift,
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      keywords: ['forklift 10ton', 'forklift 16ton', 'forklift'],
    },
    {
      id: 'telehandlers',
      name: 'Telehandlers',
      nameAr: 'الرافعات التلسكوبية',
      icon: Construction,
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      keywords: ['telehanlder', 'telehandler'],
    },
    {
      id: 'loaders',
      name: 'Loaders',
      nameAr: 'المحملات',
      icon: Loader,
      color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      keywords: ['backhoe loader', 'skid steel loader', 'wheel loader', 'loader'],
    },
    {
      id: 'rollers',
      name: 'Rollers/Compactors',
      nameAr: 'الضاغطات',
      icon: RollerCoaster,
      color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      keywords: [
        'roller compactor 3 ton',
        'roller compactor 10ton',
        'roller compactor 10ton',
        'roller compactor',
        'roller',
        'compactor',
      ],
    },
    {
      id: 'excavators',
      name: 'Excavators',
      nameAr: 'الحفارات',
      icon: Shovel,
      color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      keywords: ['mini excavator', 'excavator'],
    },
    {
      id: 'trucks',
      name: 'Trucks',
      nameAr: 'الشاحنات',
      icon: Truck,
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      keywords: [
        'water tanker(18000ltr)',
        'boom truck',
        'dumper truck',
        'traila truck',
        'concrete mixer truck',
        'fire truck',
        'lowbed',
        'trailer',
        'dyna-3ton',
        'tanker',
        'dumper',
        'mixer',
        'truck',
      ],
    },
    {
      id: 'cranes',
      name: 'Cranes',
      nameAr: 'الرافعات',
      icon: Building,
      color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      keywords: [
        'towercrane',
        'mobile crane -truck mounted',
        'mobile crane -rt',
        'mobile crane',
        'crawler crane',
        'crane',
      ],
    },
    {
      id: 'lifts',
      name: 'Manlifts/Scissor Lifts',
      nameAr: 'المنصات الهوائية/المقصية',
      icon: ArrowBigUp,
      color: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
      keywords: [
        'manlift 22m with operator',
        'manlif 26m with operator',
        'scissor lift with operator',
        'manlift',
        'scissor lift',
        'lift',
      ],
    },
    {
      id: 'graders',
      name: 'Graders',
      nameAr: 'المسويات',
      icon: Gauge,
      color: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
      keywords: ['grader'],
    },
  ];

  /* Fetch data directly with fetch to avoid any axios baseURL/interceptor issues */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/equipment', { credentials: 'include' });
        const raw = await res.json();
        const list = toArray(raw);
        if (!alive) return;
        setEquipment(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Error fetching /api/equipment:', e);
        if (alive) setEquipment([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* Compute counts on the client from equipment_name */
  const counts = useMemo(() => {
    const rows = Array.isArray(equipment) ? equipment : [];
    const map = {};
    for (const cat of categories) {
      map[cat.id] = rows.filter((eq) => includesAny(getName(eq), cat.keywords)).length;
    }
    return map;
  }, [equipment]);

  const rows = Array.isArray(equipment) ? equipment : [];

  const filteredEquipment = rows.filter((eq) => {
    const q = norm(searchTerm);
    const matchesSearch =
      norm(getName(eq)).includes(q) ||
      norm(getAsset(eq)).includes(q) ||
      norm(getPlate(eq)).includes(q) ||
      norm(getDept(eq)).includes(q) ||
      norm(getStatus(eq)).includes(q);

    const matchesCategory = selectedCategory
      ? includesAny(getName(eq), (categories.find((c) => c.id === selectedCategory)?.keywords) || [])
      : true;

    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status = '') => {
    switch (norm(status)) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'in use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) window.open(`tel:${phoneNumber}`, '_self');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900" />
      </div>
    );
  }

  /* Category grid view */
  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('equipment')}</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('search_equipment')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = counts[category.id] ?? 0;
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${category.color}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <Icon className="h-12 w-12 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-1">
                    {t('language') === 'ar' ? category.nameAr : category.name}
                  </h3>
                  <p className="text-sm opacity-75">
                    {count} {t('equipment')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {searchTerm && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Search Results ({filteredEquipment.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map((eq) => (
                <EquipmentCard
                  key={eq.equipment_id ?? `${getAsset(eq)}-${getPlate(eq)}`}
                  equipment={eq}
                  onCall={handleCall}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* List view of one category */
  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => setSelectedCategory(null)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('back')}</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('language') === 'ar'
              ? selectedCategoryData?.nameAr
              : selectedCategoryData?.name}
          </h1>
          <p className="text-gray-600">
            {filteredEquipment.length} {t('equipment')}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('search_equipment')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((eq) => (
          <EquipmentCard
            key={eq.equipment_id ?? `${getAsset(eq)}-${getPlate(eq)}`}
            equipment={eq}
            onCall={handleCall}
          />
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No equipment found matching your search.</p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Child Card */
/* -------------------------------------------------------------------------- */

function EquipmentCard({ equipment, onCall }) {
  const { t } = useTranslation();

  const getStatusColor = (status = '') => {
    switch (norm(status)) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'in use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Truck className="h-5 w-5 mr-2 text-blue-600" />
            {getName(equipment)}
          </CardTitle>
          <Badge className={getStatusColor(getStatus(equipment))}>
            {t(norm(getStatus(equipment)).replace(' ', '_'))}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-600 font-medium">{t('asset_no')}</p>
              <p className="font-bold text-blue-900">{getAsset(equipment)}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">{t('plate_serial_no')}</p>
              <p className="font-bold text-blue-900">{getPlate(equipment)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600 text-sm font-medium">{t('zone_department')}</p>
          <p className="font-semibold text-gray-900">{getDept(equipment)}</p>
        </div>

        <div className="space-y-2">
          <p className="text-gray-600 text-sm font-medium">{t('assigned_driver')}</p>

          {getDayDriverName(equipment) && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-yellow-900">
                    {t('day_shift')}: {getDayDriverName(equipment)}
                  </p>
                  <p className="text-sm text-yellow-700">{getDayDriverPhone(equipment)}</p>
                </div>
                {getDayDriverPhone(equipment) && (
                  <Button
                    size="sm"
                    onClick={() => onCall(getDayDriverPhone(equipment))}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {getNightDriverName(equipment) && (
            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-indigo-900">
                    {t('night_shift')}: {getNightDriverName(equipment)}
                  </p>
                  <p className="text-sm text-indigo-700">{getNightDriverPhone(equipment)}</p>
                </div>
                {getNightDriverPhone(equipment) && (
                  <Button
                    size="sm"
                    onClick={() => onCall(getNightDriverPhone(equipment))}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {!getDayDriverName(equipment) && !getNightDriverName(equipment) && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-500">{t('unassigned')}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">{t('shift_type')}</p>
            <p className="font-medium">{equipment?.shift_type || ''}</p>
          </div>
          <div>
            <p className="text-gray-600">{t('company_supplier')}</p>
            <p className="font-medium">{equipment?.company_supplier || ''}</p>
          </div>
        </div>

        {equipment?.remarks && (
          <div>
            <p className="text-gray-600 text-sm">{t('remarks')}</p>
            <p className="font-medium">{equipment?.remarks}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
