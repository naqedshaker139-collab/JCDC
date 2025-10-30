import { useState, useEffect } from 'react';
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
  Building
} from 'lucide-react';
import axios from '../api'; // uses baseURL defined in src/api.js

// Normalize any API payload to an array
function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
}

// Safe getters to tolerate differing API field names
const getName = (eq) => eq?.equipment_name ?? eq?.name ?? '';
const getStatus = (eq) => eq?.status ?? eq?.equipment_status ?? '';
const getAsset = (eq) => eq?.asset_no ?? eq?.assetNo ?? '';
const getPlate = (eq) => eq?.plate_serial_no ?? eq?.plateSerialNo ?? '';
const getDept = (eq) => eq?.zone_department ?? eq?.department ?? '';
const getDayDriverName = (eq) => eq?.day_shift_driver_name ?? eq?.dayDriverName ?? '';
const getDayDriverPhone = (eq) => eq?.day_shift_driver_phone ?? eq?.dayDriverPhone ?? '';
const getNightDriverName = (eq) => eq?.night_shift_driver_name ?? eq?.nightDriverName ?? '';
const getNightDriverPhone = (eq) => eq?.night_shift_driver_phone ?? eq?.nightDriverPhone ?? '';

// Case-insensitive keyword includes
const includesAny = (name, keywords) => {
  const n = String(name || '').toLowerCase();
  return keywords.some(k => n.includes(String(k).toLowerCase()));
};

const EquipmentList = () => {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]); // keep state as array
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Categories mapped to your DB names, normalized to lowercase keywords
  const categories = [
    {
      id: 'forklifts',
      name: 'Forklifts',
      nameAr: 'الرافعات الشوكية',
      icon: Forklift,
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      keywords: [
        'Forklift 10Ton',
        'Forklift 16Ton',
        'Forklift'
      ].map(s => s.toLowerCase())
    },
    {
      id: 'telehandlers',
      name: 'Telehandlers',
      nameAr: 'الرافعات التلسكوبية',
      icon: Construction,
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      keywords: [
        'Telehanlder', // spelling from the sheet
        'Telehandler'
      ].map(s => s.toLowerCase())
    },
    {
      id: 'loaders',
      name: 'Loaders',
      nameAr: 'المحملات',
      icon: Loader,
      color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      keywords: [
        'Backhoe Loader',
        'Skid Steel Loader',
        'Wheel Loader',
        'Loader'
      ].map(s => s.toLowerCase())
    },
    {
      id: 'rollers',
      name: 'Rollers/Compactors',
      nameAr: 'الضاغطات',
      icon: RollerCoaster,
      color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      keywords: [
        'Roller Compactor 3 Ton',
        'Roller Compactor 10Ton',
        'Roller Compactor  10Ton',
        'Roller Compactor',
        'Roller',
        'Compactor'
      ].map(s => s.toLowerCase())
    },
    {
      id: 'excavators',
      name: 'Excavators',
      nameAr: 'الحفارات',
      icon: Shovel,
      color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      keywords: [
        'Mini Excavator',
        'Excavator'
      ].map(s => s.toLowerCase())
    },
    {
      id: 'trucks',
      name: 'Trucks',
      nameAr: 'الشاحنات',
      icon: Truck,
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      keywords: [
        'Water Tanker(18000LTR)',
        'Boom Truck',
        'Dumper Truck',
        'TRAILA TRUCK',
        'Concrete Mixer Truck',
        'Fire Truck',
        'Lowbed',
        'Trailer',
        'Dyna-3Ton',
        'Tanker',
        'Dumper',
        'Mixer',
        'Truck'
      ].map(s => s.toLowerCase())
    },
    {
      id: 'cranes',
      name: 'Cranes',
      nameAr: 'الرافعات',
      icon: Building,
      color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      keywords: [
        'TOWERCRANE',
        'Mobile Crane -Truck Mounted',
        'Mobile Crane -RT',
        'Mobile Crane',
        'Crawler Crane',
        'Crane'
      ].map(s => s.toLowerCase())
    },
    {
      id: 'lifts',
      name: 'Manlifts/Scissor Lifts',
      nameAr: 'المنصات الهوائية/المقصية',
      icon: ArrowBigUp,
      color: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
      keywords: [
        'Manlift 22M With Operator',
        'Manlif 26M With operator',
        'Scissor lift With operator',
        'Manlift',
        'Scissor lift',
        'Lift'
      ].map(s => s.toLowerCase())
    },
    {
      id: 'graders',
      name: 'Graders',
      nameAr: 'المسويات',
      icon: Gauge,
      color: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
      keywords: [
        'Grader'
      ].map(s => s.toLowerCase())
    }
  ];

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      // baseURL is set in src/api.js → '/api' or 'http://localhost:5000/api' in DEV (Option B)
      const response = await axios.get('/equipment');
      const list = toArray(response?.data);
      setEquipment(list);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status = '') => {
    switch (String(status).toLowerCase()) {
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
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  // Always operate on an array
  const rows = Array.isArray(equipment) ? equipment : [];

  const getCategoryEquipmentCount = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return 0;
    return rows.filter(eq => includesAny(getName(eq), cat.keywords)).length;
  };

  const filteredEquipment = rows.filter(eq => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      getName(eq).toLowerCase().includes(q) ||
      getAsset(eq).toLowerCase().includes(q) ||
      getPlate(eq).toLowerCase().includes(q) ||
      getDept(eq).toLowerCase().includes(q) ||
      getStatus(eq).toLowerCase().includes(q);

    const matchesCategory = selectedCategory
      ? includesAny(getName(eq), (categories.find(c => c.id === selectedCategory)?.keywords) || [])
      : true;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  // Category view
  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('equipment')}</h1>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('search_equipment')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const count = getCategoryEquipmentCount(category.id);

            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${category.color}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <IconComponent className="h-12 w-12 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-1">
                    {t('language') === 'ar' ? category.nameAr : category.name}
                  </h3>
                  <p className="text-sm opacity-75">{count} {t('equipment')}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Show all equipment if search is active */}
        {searchTerm && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Search Results ({filteredEquipment.length})</h2>
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

  // Equipment list view for selected category
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
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
            {t('language') === 'ar' ? selectedCategoryData.nameAr : selectedCategoryData.name}
          </h1>
          <p className="text-gray-600">{filteredEquipment.length} {t('equipment')}</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('search_equipment')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
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
};

// Equipment Card Component
const EquipmentCard = ({ equipment, onCall }) => {
  const { t } = useTranslation();

  const getStatusColor = (status = '') => {
    switch (String(status).toLowerCase()) {
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
            {t(String(getStatus(equipment)).toLowerCase().replace(' ', '_'))}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Information */}
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

        {/* Zone/Department */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600 text-sm font-medium">{t('zone_department')}</p>
          <p className="font-semibold text-gray-900">{getDept(equipment)}</p>
        </div>

        {/* Driver Information */}
        <div className="space-y-2">
          <p className="text-gray-600 text-sm font-medium">{t('assigned_driver')}</p>

          {/* Day Shift Driver */}
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

          {/* Night Shift Driver */}
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

          {/* No Driver Assigned */}
          {!getDayDriverName(equipment) && !getNightDriverName(equipment) && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-500">{t('unassigned')}</p>
            </div>
          )}
        </div>

        {/* Additional Details */}
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
};

export default EquipmentList;