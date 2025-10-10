import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Users, ClipboardList, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    total_equipment: 0,
    available_equipment: 0,
    total_drivers: 0,
    pending_requests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t('total_equipment'),
      value: stats.total_equipment,
      icon: Truck,
      color: 'bg-blue-500'
    },
    {
      title: t('available_equipment'),
      value: stats.available_equipment,
      icon: Truck,
      color: 'bg-green-500'
    },
    {
      title: t('total_drivers'),
      value: stats.total_drivers,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: t('pending_requests'),
      value: stats.pending_requests,
      icon: AlertCircle,
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('welcome')}
        </h1>
        <p className="text-gray-600">
          China Railway Construction Corporation - Jeddah Stadium Project
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-full`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/equipment"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Truck className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">{t('equipment')}</h3>
              <p className="text-sm text-gray-600">View all equipment</p>
            </div>
          </a>
          
          <a
            href="/drivers"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">{t('drivers')}</h3>
              <p className="text-sm text-gray-600">View driver directory</p>
            </div>
          </a>
          
          <a
            href="/request"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <ClipboardList className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">{t('request_equipment')}</h3>
              <p className="text-sm text-gray-600">Request equipment</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

