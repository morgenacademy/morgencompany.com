import { describe, expect, it } from "vitest";
import { getDaypartGreeting } from "./daypartGreeting";

describe("getDaypartGreeting", () => {
  it("returns the morning greeting", () => {
    expect(getDaypartGreeting(new Date("2026-06-08T08:00:00"))).toBe("GoedeMORGEN");
  });

  it("returns the afternoon greeting", () => {
    expect(getDaypartGreeting(new Date("2026-06-08T14:00:00"))).toBe("GoedeMIDDAG");
  });

  it("returns the evening greeting", () => {
    expect(getDaypartGreeting(new Date("2026-06-08T20:00:00"))).toBe("GoedeAVOND");
  });

  it("returns the night greeting", () => {
    expect(getDaypartGreeting(new Date("2026-06-08T02:00:00"))).toBe("GoedeNACHT");
  });
});
