import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PortalWereldPoort from "./PortalWereldPoort";

const hrefVoor = (beschrijving: string) =>
  screen.getByLabelText(beschrijving).getAttribute("href");

const QUERY =
  "?utm_source=portal&utm_medium=referral&utm_campaign=wereld-poort";

describe("PortalWereldPoort", () => {
  // De routes van de wereld zelf, niet de marketingpagina's: pasWereldRouteToe()
  // opent daarmee het bijbehorende gebouw of het Kompas-vak.
  const bestemmingen: [string, string][] = [
    ["Trainingen: AI-training voor teams", "train"],
    ["Implementatie: begeleiding bij het invoeren van AI", "implement"],
    ["AI-oplossingen: maatwerk en automatisering", "build"],
    ["Inspiratie: keynotes, podcast en boek", "inspire"],
    ["Projecten, klantcases en praktijkvoorbeelden", "projecten"],
    ["Over Morgen, team en aanpak", "over-morgen"],
    ["Wegwijzer: vind de route die bij je past", "wegwijzer"],
  ];

  it("wijst alle zeven hotspots naar hun eigen route in de wereld", () => {
    render(<PortalWereldPoort />);

    for (const [beschrijving, route] of bestemmingen) {
      expect(hrefVoor(beschrijving)).toBe(
        `https://morgencompany.com/${QUERY}#${route}`,
      );
    }
  });

  it("geeft elke uitgaande link de utm-parameters mee", () => {
    render(<PortalWereldPoort />);

    for (const [beschrijving] of bestemmingen) {
      const href = hrefVoor(beschrijving);
      expect(href).toContain("utm_source=portal");
      expect(href).toContain("utm_medium=referral");
      expect(href).toContain("utm_campaign=wereld-poort");
    }

    expect(
      screen.getByRole("link", { name: /De wereld van Morgen in/ }),
    ).toHaveAttribute("href", `https://morgencompany.com/${QUERY}`);
  });

  it("zet de query voor de hash, anders leest de wereld de route niet", () => {
    render(<PortalWereldPoort />);

    for (const [beschrijving, route] of bestemmingen) {
      const href = hrefVoor(beschrijving) ?? "";
      expect(href.indexOf("utm_source")).toBeLessThan(href.indexOf("#"));
      expect(href.endsWith(`#${route}`)).toBe(true);
    }
  });
});
