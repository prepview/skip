import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/components/ComingSoon';

export default function CalendarScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('tabs.calendar')} description={t('soon.calendar')} />;
}
