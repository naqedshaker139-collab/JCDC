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
  Wrench,
  Building
} from 'lucide-react';
import axios from 'axios';

const EquipmentList = () => {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Equipment categories with icons
  const categories = [
    {
      id: 'forklifts',
      name: 'Forklifts',
      nameAr: 'الرافعات الشوكية',
      icon: Forklift,
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      keywords: ['Forklift']
    },
    {
      id: 'telehandlers',
      name: 'Telehandlers',
      nameAr: 'الرافعات التلسكوبية',
      icon: Construction,
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      keywords: ['Telehanlder']
    },
    {
      id: 'loaders',
      name: 'Loaders',
      nameAr: 'المحملات',
      icon: Loader,
      color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      keywords: ['Backhoe Loader', 'Skid Steel Loader', 'Wheel Loader']
    },
    {
      id: 'rollers',
      name: 'Rollers/Compactors',
      nameAr: 'الضاغطات',
      icon: RollerCoaster,
      color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      keywords: ['Roller Compactor']
    },
    {
      id: 'excavators',
      name: 'Excavators',
      nameAr: 'الحفارات',
      icon: Shovel,
      color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      keywords: ['Excavator']
    },
    {
      id: 'trucks',
      name: 'Trucks',
      nameAr: 'الشاحنات',
      icon: Truck,
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      keywords: ['Truck', 'Tanker', 'Dumper', 'TRAILA', 'Trailer', 'Lowbed', 'Dyna', 'Mixer', 'Fire']
    },
    {
      id: 'cranes',
      name: 'Cranes',
      nameAr: 'الرافعات',
      icon: Building,
      color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      keywords: ['Crane', 'TOWERCRANE']
    },
    {
      id: 'lifts',
      name: 'Lifts',
      nameAr: 'المصاعد',
      icon: ArrowBigUp,
      color: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
      keywords: ['Manlift', 'Scissor lift']
    },
    {
      id: 'graders',
      name: 'Graders',
      nameAr: 'المسويات',
      icon: Gauge,
      color: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
      keywords: ['Grader']
    }
  ];

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('/api/equipment');
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEquipmentCategory = (equipmentName) => {
    for (const category of categories) {
      if (category.keywords.some(keyword => equipmentName.includes(keyword))) {
        return category.id;
      }
    }
    return null;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.asset_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.plate_serial_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.zone_department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? getEquipmentCategory(eq.equipment_name) === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryEquipmentCount = (categoryId) => {
    return equipment.filter(eq => getEquipmentCategory(eq.equipment_name) === categoryId).length;
  };

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
                <EquipmentCard key={eq.equipment_id} equipment={eq} onCall={handleCall} />
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
          <EquipmentCard key={eq.equipment_id} equipment={eq} onCall={handleCall} />
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
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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
            {equipment.equipment_name}
          </CardTitle>
          <Badge className={getStatusColor(equipment.status)}>
            {t(equipment.status.toLowerCase().replace(' ', '_'))}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Information */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-600 font-medium">{t('asset_no')}</p>
              <p className="font-bold text-blue-900">{equipment.asset_no}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">{t('plate_serial_no')}</p>
              <p className="font-bold text-blue-900">{equipment.plate_serial_no}</p>
            </div>
          </div>
        </div>

        {/* Zone/Department */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600 text-sm font-medium">{t('zone_department')}</p>
          <p className="font-semibold text-gray-900">{equipment.zone_department}</p>
        </div>

        {/* Driver Information */}
        <div className="space-y-2">
          <p className="text-gray-600 text-sm font-medium">{t('assigned_driver')}</p>
          
          {/* Day Shift Driver */}
          {equipment.day_shift_driver_name && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-yellow-900">
                    {t('day_shift')}: {equipment.day_shift_driver_name}
                  </p>
                  <p className="text-sm text-yellow-700">{equipment.day_shift_driver_phone}</p>
                </div>
                {equipment.day_shift_driver_phone && (
                  <Button
                    size="sm"
                    onClick={() => onCall(equipment.day_shift_driver_phone)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Night Shift Driver */}
          {equipment.night_shift_driver_name && (
            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-indigo-900">
                    {t('night_shift')}: {equipment.night_shift_driver_name}
                  </p>
                  <p className="text-sm text-indigo-700">{equipment.night_shift_driver_phone}</p>
                </div>
                {equipment.night_shift_driver_phone && (
                  <Button
                    size="sm"
                    onClick={() => onCall(equipment.night_shift_driver_phone)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* No Driver Assigned */}
          {!equipment.day_shift_driver_name && !equipment.night_shift_driver_name && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-500">{t('unassigned')}</p>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">{t('shift_type')}</p>
            <p className="font-medium">{equipment.shift_type}</p>
          </div>
          <div>
            <p className="text-gray-600">{t('company_supplier')}</p>
            <p className="font-medium">{equipment.company_supplier}</p>
          </div>
        </div>

        {equipment.remarks && (
          <div>
            <p className="text-gray-600 text-sm">{t('remarks')}</p>
            <p className="font-medium">{equipment.remarks}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentList;

