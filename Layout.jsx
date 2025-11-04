import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';

const Layout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isRTL = i18n.language === 'ar';
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const navigation = [
    { name: t('dashboard'), href: '/' },
    { name: t('equipment'), href: '/equipment' },
    { name: t('drivers'), href: '/drivers' },
    { name: t('request_equipment'), href: '/request' },
    { name: t('request_history'), href: '/requests' }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="bg-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-white text-xl font-bold">JCDC, CRCC & PMV EQUIPMENT</h1>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className={`${isRTL ? 'mr-10 flex items-baseline space-x-reverse space-x-4' : 'ml-10 flex items-baseline space-x-4'}`}>
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Language Switcher and Mobile menu button */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleLanguage}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700"
              >
                <Globe className="h-4 w-4 mr-2" />
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </Button>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-blue-700"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-800">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

