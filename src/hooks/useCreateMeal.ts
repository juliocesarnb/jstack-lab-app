import { useMutation } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';

import { httpClient } from '../services/httpClient';

type CreateMealResponse = {
  uploadURL: string;
  mealId: string;
}

export function useCreateMeal(fileType: 'image/jpeg' | 'audio/m4a') {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (uri: string) => {
      const { data } = await httpClient.post<CreateMealResponse>('/meals', {
        fileType,
      });

      await FileSystem.uploadAsync(data.uploadURL, uri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });
    },
  });

  return {
    createMeal: mutateAsync,
    isLoading: isPending,
  };
}