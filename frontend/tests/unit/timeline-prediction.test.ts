import { describe, it, expect } from "vitest";
import {
  parseDateUTC,
  formatDateDisplay,
  toHtmlDateInput,
  fromHtmlDateInput,
  addDaysToDate,
  calculateInterestCarry,
  predictTimelineSchedule,
} from "@/lib/utils/timeline-prediction";

describe("Timeline Prediction Engine Unit Tests", () => {
  it("accurately handles date parsing and formatting across formats", () => {
    const d = parseDateUTC("Oct 15, 2025");
    expect(formatDateDisplay(d)).toBe("Oct 15, 2025");

    const inputVal = toHtmlDateInput("Oct 15, 2025");
    expect(inputVal).toBe("2025-10-15");

    const backToDisplay = fromHtmlDateInput("2025-10-15");
    expect(backToDisplay).toBe("Oct 15, 2025");
  });

  it("adds days accurately across month boundaries", () => {
    // Oct 20 + 35 days = Nov 24
    expect(addDaysToDate("Oct 20, 2025", 35)).toBe("Nov 24, 2025");

    // Nov 24 + 4 days = Nov 28
    expect(addDaysToDate("Nov 24, 2025", 4)).toBe("Nov 28, 2025");

    // Nov 28 + 5 days = Dec 03
    expect(addDaysToDate("Nov 28, 2025", 5)).toBe("Dec 03, 2025");

    // Dec 03 + 5 days = Dec 08
    expect(addDaysToDate("Dec 03, 2025", 5)).toBe("Dec 08, 2025");

    // Dec 08 + 4 days = Dec 12
    expect(addDaysToDate("Dec 08, 2025", 4)).toBe("Dec 12, 2025");

    // Dec 12 + 3 days = Dec 15
    expect(addDaysToDate("Dec 12, 2025", 3)).toBe("Dec 15, 2025");
  });

  it("calculates loan carrying cost interest correctly", () => {
    const carry35 = calculateInterestCarry(35);
    expect(carry35.formatted).toBe("+$28,500");
    expect(carry35.cents).toBe(2850000);

    const carry0 = calculateInterestCarry(0);
    expect(carry0.formatted).toBe("+$0");
    expect(carry0.cents).toBe(0);
  });

  it("predicts chronological schedule with default 35 days delay", () => {
    const schedule = predictTimelineSchedule(35);

    expect(schedule.hvacTargetDate).toBe("Nov 24, 2025");
    expect(schedule.finalCoDate).toBe("Dec 15, 2025");
    expect(schedule.interestCarry.formatted).toBe("+$28,500");
    expect(schedule.timeGivenDays).toBe(40); // 5 base days + 35 delay days

    const hvac = schedule.milestones.find((m) => m.code === "04.03");
    expect(hvac?.targetDate).toBe("Nov 24, 2025");

    const roofing = schedule.milestones.find((m) => m.code === "03.04");
    expect(roofing?.targetDate).toBe("Nov 28, 2025");

    const windows = schedule.milestones.find((m) => m.code === "06.01");
    expect(windows?.targetDate).toBe("Dec 03, 2025");

    const drywall = schedule.milestones.find((m) => m.code === "05.01");
    expect(drywall?.targetDate).toBe("Dec 08, 2025");

    const finishes = schedule.milestones.find((m) => m.code === "05.02");
    expect(finishes?.targetDate).toBe("Dec 12, 2025");

    const co = schedule.milestones.find((m) => m.code === "01.06");
    expect(co?.targetDate).toBe("Dec 15, 2025");
  });

  it("allows user custom date overrides and cascades unedited milestones", () => {
    // User overrides Roofing (tl-15) to Dec 01, 2025
    const schedule = predictTimelineSchedule(35, {
      "tl-15": "Dec 01, 2025",
    });

    const roofing = schedule.milestones.find((m) => m.code === "03.04");
    expect(roofing?.targetDate).toBe("Dec 01, 2025");
    expect(roofing?.isUserOverridden).toBe(true);

    // Windows (tl-16) is 5 days after Roofing => Dec 01 + 5 = Dec 06
    const windows = schedule.milestones.find((m) => m.code === "06.01");
    expect(windows?.targetDate).toBe("Dec 06, 2025");
    expect(windows?.isUserOverridden).toBe(false);
  });
});
