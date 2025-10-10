import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Phone, User, IdCard, Truck } from 'lucide-react';
import axios from 'axios';

const DriverList = () => {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get('/api/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone_number.includes(searchTerm) ||
    driver.eqama_number.includes(searchTerm) ||
    (driver.day_shift_equipment_name && driver.day_shift_equipment_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (driver.night_shift_equipment_name && driver.night_shift_equipment_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('drivers')}</h1>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('search_drivers')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => (
          <Card key={driver.driver_id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                {driver.driver_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{driver.phone_number}</span>
                </div>
                <div className="flex items-center">
                  <IdCard className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{driver.eqama_number}</span>
                </div>
              </div>
              
              {(driver.day_shift_equipment_name || driver.night_shift_equipment_name) && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{t('assigned_machine')}</p>
                  {driver.day_shift_equipment_name && (
                    <p className="font-medium text-blue-900 flex items-center">
                      <Truck className="h-4 w-4 mr-2" /> {t('day_shift')}: {driver.day_shift_equipment_name} ({driver.day_shift_machine_number})
                    </p>
                  )}
                  {driver.night_shift_equipment_name && (
                    <p className="font-medium text-blue-900 flex items-center">
                      <Truck className="h-4 w-4 mr-2" /> {t('night_shift')}: {driver.night_shift_equipment_name} ({driver.night_shift_machine_number})
                    </p>
                  )}
                </div>
              )}
              
              {!driver.day_shift_equipment_name && !driver.night_shift_equipment_name && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{t('assigned_machine')}</p>
                  <p className="font-medium text-gray-500">{t('unassigned')}</p>
                </div>
              )}
              
              <Button
                onClick={() => handleCall(driver.phone_number)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Phone className="h-4 w-4 mr-2" />
                {t('call')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No drivers found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default DriverList;


