import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/components/ComingSoon';

export default function StatsScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('tabs.stats')} description={t('soon.stats')} />;
}
