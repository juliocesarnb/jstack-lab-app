import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { httpClient } from '../services/httpClient';
import { DailyStats } from './DailyStats';
import { DateSwitcher } from './DateSwitcher';
import { MealCard } from './MealCard';

interface IMealsListHeaderProps {
  currentDate: Date;
  onPreviousDate(): void;
  onNextDate(): void;
}

function MealsListHeader({
  currentDate,
  onNextDate,
  onPreviousDate,
}: IMealsListHeaderProps) {
  const { user } = useAuth();

  return (
    <View>
      <DateSwitcher
        currentDate={currentDate}
        onNextDate={onNextDate}
        onPreviousDate={onPreviousDate}
      />

      <View className="mt-2">
        <DailyStats
          calories={{
            current: 0,
            goal: user!.calories,
          }}
          proteins={{
            current: 0,
            goal: user!.proteins,
          }}
          carbohydrates={{
            current: 0,
            goal: user!.carbohydrates,
          }}
          fats={{
            current: 0,
            goal: user!.fats
          }}
        />
      </View>

      <View className="h-px bg-gray-200 mt-7" />

      <Text className="text-black-700 m-5 text-base font-sans-medium tracking-[1.28px]">
        REFEIÇÕES
      </Text>
    </View>
  );
}

function Separator() {
  return (
    <View className="h-8" />
  );
}

type Meals = {
  name: string;
  id: string;
  icon: string;
  foods: {
    name: string;
    quantity: string;
    calories: number;
    proteins: number;
    carbohydrates: number;
    fasts: number;
  }[];
  createdAt: string;
}

export function MealsList() {
  const { bottom } = useSafeAreaInsets();

  const [currentDate, setCurrentDate] = useState(new Date());

  const dateParam = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }, [currentDate]);

  const { data: meals } = useQuery({
    queryKey: ['meals', dateParam],
    staleTime: 15_000,
    queryFn: async () => {
      const { data } = await httpClient.get<{ meals: Meals[] }>('/meals', {
        params: {
          date: dateParam,
        },
      });

      return data.meals;
    },
  });

  function handlePreviousDate() {
    setCurrentDate(prevState => {
      const newDate = new Date(prevState);
      newDate.setDate(newDate.getDate() - 1);

      return newDate;
    });
  }

  function handleNextDate() {
    setCurrentDate(prevState => {
      const newDate = new Date(prevState);
      newDate.setDate(newDate.getDate() + 1);

      return newDate;
    });
  }
  
  return (
    <FlatList
      data={meals}
      contentContainerStyle={{ paddingBottom: 80 + bottom + 16 }}
      keyExtractor={meal => meal.id}
      ListEmptyComponent={<Text>Nenhuma refeição cadastrada...</Text>}
      ListHeaderComponent={(
        <MealsListHeader
          currentDate={currentDate}
          onNextDate={handleNextDate}
          onPreviousDate={handlePreviousDate}
        />
      )}
      ItemSeparatorComponent={Separator}
      renderItem={({ item: meal }) => (
        <View className="mx-5">
          <MealCard
            id={meal.id}
            name={meal.name}
          />
        </View>
      )}
    />
  );
}
