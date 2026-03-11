import { useQuery } from "@tanstack/react-query";
import type { Weather } from "../backend";
import { useActor } from "./useActor";

export function useGetWeather(cityName: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Weather>({
    queryKey: ["weather", cityName],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getWeather(cityName);
    },
    enabled: !!actor && !isFetching && cityName.trim().length > 0,
    retry: 1,
  });
}
