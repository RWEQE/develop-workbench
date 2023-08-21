import { useApplicationContext } from '@/context/ApplicationContext';

function useHasAdminRole() {
  const { pmCodes } = useApplicationContext();
  return (
    (pmCodes || []).indexOf('role/organization/default/administrator') > -1
  );
}

export { useHasAdminRole };
