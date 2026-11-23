import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/components/ComingSoon';

export default function JourneyScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('tabs.journey')} description={t('soon.journey')} />;
}
