// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import * as FileSystem from 'expo-file-system/legacy';

// import { httpClient } from '../services/httpClient';

// type CreateMealResponse = {
//   uploadURL: string;
//   mealId: string;
// }

// type CreateMealParams = {
//   fileType: 'image/jpeg' | 'audio/m4a';
//   onSuccess(mealId: string): void;
// }

// export function useCreateMeal({ fileType, onSuccess }: CreateMealParams) {
//   const queryClient = useQueryClient();

//   const { mutateAsync, isPending } = useMutation({
//     mutationFn: async (uri: string) => {
//       const { data } = await httpClient.post<CreateMealResponse>('/meals', {
//         fileType,
//       });

//       await FileSystem.uploadAsync(data.uploadURL, uri, {
//         httpMethod: 'PUT',
//         uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
//       });

//       return { mealId: data.mealId };
//     },
//     onSuccess: ({ mealId }) => {
//       onSuccess(mealId);
//       queryClient.refetchQueries({ queryKey: ['meals'] });
//     },
//   });

//   return {
//     createMeal: mutateAsync,
//     isLoading: isPending,
//   };
// }

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';

import { httpClient } from '../services/httpClient';

type CreateMealResponse = {
  uploadURL: string;
  mealId: string;
}

type CreateMealParams = {
  fileType: 'image/jpeg' | 'audio/m4a';
  onSuccess(mealId: string): void;
}

export function useCreateMeal({ fileType, onSuccess }: CreateMealParams) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (uri: string) => {
      console.log('🎵 [1/4] Iniciando createMeal...', { uri, fileType });
      
      // Debug: verificar se tem token
      const authHeader = httpClient.defaults.headers.common['Authorization'];
      console.log('🔐 Token presente:', !!authHeader, authHeader ? 'Bearer ***' : 'Nenhum token');
      
      try {
        console.log('🌐 [2/4] Chamando httpClient.post /meals...');
        
        const { data } = await httpClient.post<CreateMealResponse>('/meals', {
          fileType,
        });
        
        console.log('✅ [2/4] Resposta da API recebida:', data);

        console.log('📤 [3/4] Iniciando upload para S3...', data.uploadURL);
        
        const uploadResult = await FileSystem.uploadAsync(data.uploadURL, uri, {
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        });
        
        console.log('✅ [3/4] Upload concluído:', uploadResult);
        console.log('🎉 [4/4] Processo completo! MealId:', data.mealId);

        return { mealId: data.mealId };
        
      } catch (error) {
        console.error('💥 Erro no createMeal:', error);
        
        if (error.response) {
          console.error('📡 Erro da API:', {
            status: error.response.status,
            data: error.response.data,
          });
        }
        
        throw error;
      }
    },
    onSuccess: ({ mealId }) => {
      console.log('🎯 onSuccess chamado com mealId:', mealId);
      onSuccess(mealId);
      queryClient.refetchQueries({ queryKey: ['meals'] });
    },
    onError: (error) => {
      console.error('💀 onError chamado:', error);
    },
  });

  return {
    createMeal: mutateAsync,
    isLoading: isPending,
  };
}