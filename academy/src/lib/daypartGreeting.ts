export const getDaypartGreeting = (date = new Date()) => {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "GoedeMORGEN";
  }

  if (hour >= 12 && hour < 18) {
    return "GoedeMIDDAG";
  }

  if (hour >= 18 && hour < 24) {
    return "GoedeAVOND";
  }

  return "GoedeNACHT";
};

// Het dagdeel-woord dat achter het doorgestreepte merkwoord "MORGEN" verschijnt.
// 's Ochtends klopt "MORGEN" gewoon, dus dan geen doorhaling en geen extra woord (null).
export type Daypart = "middag" | "avond" | "nacht";

export const getDaypartPeriod = (date = new Date()): Daypart | null => {
  const hour = date.getHours();

  if (hour < 6) return "nacht";
  if (hour < 12) return null;
  if (hour < 18) return "middag";
  return "avond";
};
