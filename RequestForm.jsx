import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, CheckCircle } from 'lucide-react';
import axios from 'axios';

const RequestForm = () => {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    engineer_name: '',
    requested_equipment: '',
    notes: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('/api/equipment');
      // Filter only available equipment (Active or Available)
      const availableEquipment = response.data.filter(eq => eq.status === 'Available' || eq.status === 'Active');
      setEquipment(availableEquipment);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/requests', formData);
      setSubmitted(true);
      setFormData({
        engineer_name: '',
        requested_equipment: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your equipment request has been submitted and is now pending approval.
            </p>
            <div className="space-x-4">
              <Button onClick={() => setSubmitted(false)}>
                Submit Another Request
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/requests'}>
                View Request History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('request_equipment')}</h1>
        <p className="text-gray-600">Submit a request for equipment needed for your project</p>
      </div>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
            Equipment Request Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Engineer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('engineer_name')} *
              </label>
              <Input
                type="text"
                required
                value={formData.engineer_name}
                onChange={(e) => handleInputChange('engineer_name', e.target.value)}
                placeholder="Enter your full name"
                className="w-full"
              />
            </div>

            {/* Equipment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('requested_equipment')} *
              </label>
              <Select
                value={formData.requested_equipment}
                onValueChange={(value) => handleInputChange('requested_equipment', value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.equipment_id} value={eq.equipment_id.toString()}>
                      {eq.equipment_name} - {eq.plate_serial_no}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {equipment.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No available equipment at the moment. Please check back later.
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('request_reason')} / {t('notes')}
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Please provide details about why you need this equipment and for how long..."
                rows={4}
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={submitting || equipment.length === 0}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {submitting ? 'Submitting...' : t('submit_request')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestForm;


