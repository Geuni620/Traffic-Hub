import { useQueryClient } from '@tanstack/react-query';
import { useExternalValue } from 'external-state';
import { trafficManagerKeys } from 'lib/query/queryFactory';
import { useEffect } from 'react';
import { getGoogleMapStore } from 'store/googleMapStore';

export const GoogleMap = () => {
  const googleMap = useExternalValue(getGoogleMapStore());
  const queryClient = useQueryClient();

  useEffect(() => {
    googleMap.addListener('idle', () => {
      queryClient.invalidateQueries({
        queryKey: [...trafficManagerKeys.traffic],
      });
    });
  }, [googleMap]);

  return <></>;
};
