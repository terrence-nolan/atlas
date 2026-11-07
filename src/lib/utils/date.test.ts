import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  SITE_TIME_ZONE,
  formatCalendarDate,
  formatTimestamp,
  formatDateTime,
  getDateKey,
  isToday,
} from "./date";

describe("date utilities", () => {
  describe("SITE_TIME_ZONE", () => {
    it("uses America/New_York as the default timezone", () => {
      expect(SITE_TIME_ZONE).toBe("America/New_York");
    });
  });

  describe("getDateKey", () => {
    it("returns a YYYY-MM-DD date key using the default timezone", () => {
      expect(getDateKey("2026-11-06T15:30:00.000Z")).toBe(
        "2026-11-06",
      );
    });

    it("accounts for local calendar date boundaries", () => {
      expect(getDateKey("2026-11-06T02:30:00.000Z")).toBe(
        "2026-11-05",
      );
    });

    it("supports an explicit timezone override", () => {
      expect(
        getDateKey("2026-11-06T02:30:00.000Z", "UTC"),
      ).toBe("2026-11-06");
    });

    it("accepts Date objects", () => {
      expect(
        getDateKey(new Date("2026-11-06T15:30:00.000Z")),
      ).toBe("2026-11-06");
    });

    it("returns an empty string for null", () => {
      expect(getDateKey(null)).toBe("");
    });

    it("returns an empty string for invalid dates", () => {
      expect(getDateKey("invalid-date")).toBe("");
    });
  });

  describe("formatCalendarDate", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-11-06T15:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns Today for the current calendar date", () => {
      expect(formatCalendarDate("2026-11-06")).toBe("Today");
    });

    it("returns Yesterday for the previous calendar date", () => {
      expect(formatCalendarDate("2026-11-05")).toBe("Yesterday");
    });

    it("formats older calendar dates", () => {
      expect(formatCalendarDate("2026-11-04")).toBe(
        "Nov 4, 2026",
      );
    });

    it("does not shift date-only strings across timezone boundaries", () => {
      expect(formatCalendarDate("2026-11-03", "UTC")).toBe(
        "Nov 3, 2026",
      );

      expect(formatCalendarDate("2026-11-03", "America/Los_Angeles")).toBe(
        "Nov 3, 2026",
      );
    });

    it("supports an explicit timezone when determining Today and Yesterday", () => {
      // November 6 in UTC, but November 5 in New York.
      expect(formatCalendarDate("2026-11-05", "UTC")).toBe(
        "Yesterday",
      );

      expect(formatCalendarDate("2026-11-05")).toBe("Yesterday");
    });

    it("handles the previous calendar date across a year boundary", () => {
      vi.setSystemTime(new Date("2026-01-01T15:00:00.000Z"));

      expect(formatCalendarDate("2025-12-31")).toBe("Yesterday");
    });

    it("returns an empty string for null", () => {
      expect(formatCalendarDate(null)).toBe("");
    });

    it("returns an empty string for invalid date formats", () => {
      expect(formatCalendarDate("invalid-date")).toBe("");
      expect(formatCalendarDate("11/06/2026")).toBe("");
    });

    it("returns an empty string for impossible calendar dates", () => {
      expect(formatCalendarDate("2026-02-30")).toBe("");
      expect(formatCalendarDate("2026-13-01")).toBe("");
    });
  });

  describe("formatTimestamp", () => {
    it("formats a timestamp using the default timezone", () => {
      expect(formatTimestamp("2026-11-06T15:30:00.000Z")).toBe(
        "Nov 6, 2026",
      );
    });

    it("handles timestamps that fall on a different local calendar day", () => {
      expect(formatTimestamp("2026-11-06T02:30:00.000Z")).toBe(
        "Nov 5, 2026",
      );
    });

    it("supports an explicit timezone override", () => {
      expect(
        formatTimestamp("2026-11-06T02:30:00.000Z", "UTC"),
      ).toBe("Nov 6, 2026");
    });

    it("accepts Date objects", () => {
      expect(
        formatTimestamp(new Date("2026-11-06T15:30:00.000Z")),
      ).toBe("Nov 6, 2026");
    });

    it("returns an empty string for null", () => {
      expect(formatTimestamp(null)).toBe("");
    });

    it("returns an empty string for invalid dates", () => {
      expect(formatTimestamp("invalid-date")).toBe("");
    });
  });

  describe("formatDateTime", () => {
    it("formats a timestamp with its timezone abbreviation", () => {
      expect(formatDateTime("2026-11-06T02:30:00.000Z")).toBe(
        "Nov 5, 2026, 9:30 PM EST",
      );
    });

    it("supports an explicit timezone override", () => {
      expect(
        formatDateTime("2026-11-06T02:30:00.000Z", "UTC"),
      ).toBe("Nov 6, 2026, 2:30 AM UTC");
    });

    it("accepts Date objects", () => {
      expect(
        formatDateTime(new Date("2026-11-06T02:30:00.000Z")),
      ).toBe("Nov 5, 2026, 9:30 PM EST");
    });

    it("returns an empty string for null", () => {
      expect(formatDateTime(null)).toBe("");
    });

    it("returns an empty string for invalid dates", () => {
      expect(formatDateTime("invalid-date")).toBe("");
    });
  });

  describe("isToday", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-11-06T15:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns true when the timestamp falls on today", () => {
      expect(
        isToday("2026-11-06T12:00:00.000Z"),
      ).toBe(true);
    });

    it("returns false when the timestamp falls on yesterday", () => {
      expect(
        isToday("2026-11-05T12:00:00.000Z"),
      ).toBe(false);
    });

    it("uses the configured timezone when determining today", () => {
      expect(
        isToday("2026-11-06T02:30:00.000Z", "UTC"),
      ).toBe(true);

      expect(
        isToday("2026-11-06T02:30:00.000Z"),
      ).toBe(false);
    });

    it("handles timestamps around the local midnight boundary", () => {
      expect(
        isToday("2026-11-06T04:59:00.000Z"),
      ).toBe(false);

      expect(
        isToday("2026-11-06T05:00:00.000Z"),
      ).toBe(true);
    });

    it("returns false for null", () => {
      expect(isToday(null)).toBe(false);
    });

    it("returns false for an empty string", () => {
      expect(isToday("")).toBe(false);
    });

    it("returns false for invalid dates", () => {
      expect(isToday("invalid-date")).toBe(false);
    });
  });
});