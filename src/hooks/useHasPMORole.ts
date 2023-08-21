import { useApplicationContext } from '@/context/ApplicationContext';

function useHasPMORole() {
  const { pmCodes } = useApplicationContext();
  return (
    (pmCodes || []).indexOf('role/organization/custom/organization-pm') > -1
  );
}

export { useHasPMORole };
