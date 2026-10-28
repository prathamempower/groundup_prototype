import { describe, it, expect } from "vitest";
import {
  predictTimelineSchedule,
  calculateInterestCarry,
  BASELINE_DOWNSTREAM_MILESTONES,
} from "@/lib/utils/timeline-prediction";
import { getControlCenterAmountOrigin } from "@/lib/data/control-center-origins";

describe("Timeline Schedule Editor & Dynamic Cascade Integration", () => {
  it("anchors immediately after 04.02 Electrical Service Main (Completed Oct 15)", () => {
    // 04.02 Electrical was completed Oct 15, 2025
    // Baseline HVAC target was Oct 20, 2025 (5 working days)
    const schedule35 = predictTimelineSchedule(35);

    // Delayed target = Oct 20 + 35 days = Nov 24, 2025
    expect(schedule35.hvacTargetDate).toBe("Nov 24, 2025");
    expect(schedule35.timeGivenDays).toBe(40); // 5 base days + 35 delay days
  });

  it("cascades downstream milestones chronologically to Dec 15 substantial completion", () => {
    const schedule = predictTimelineSchedule(35);

    const dates = schedule.milestones.map((m) => m.targetDate);
    // Nov 24 (HVAC) -> Nov 28 (Roofing) -> Dec 03 (Windows) -> Dec 08 (Drywall) -> Dec 12 (Finishes) -> Dec 15 (CO)
    expect(dates).toEqual([
      "Nov 24, 2025",
      "Nov 28, 2025",
      "Dec 03, 2025",
      "Dec 08, 2025",
      "Dec 12, 2025",
      "Dec 15, 2025",
    ]);

    expect(schedule.finalCoDate).toBe("Dec 15, 2025");
  });

  it("calculates proportional carrying costs for varied user-input delay days", () => {
    const carry14 = calculateInterestCarry(14);
    expect(carry14.cents).toBe(1140000); // $11,400

    const carry21 = calculateInterestCarry(21);
    expect(carry21.cents).toBe(1710000); // $17,100

    const carry35 = calculateInterestCarry(35);
    expect(carry35.cents).toBe(2850000); // $28,500
    expect(carry35.formatted).toBe("+$28,500");
  });

  it("allows user to customize any milestone target date and cascades remaining unedited milestones", () => {
    // User pushes Roofing to Dec 02, 2025
    const schedule = predictTimelineSchedule(35, {
      "tl-15": "Dec 02, 2025",
    });

    const roofing = schedule.milestones.find((m) => m.code === "03.04");
    expect(roofing?.targetDate).toBe("Dec 02, 2025");
    expect(roofing?.isUserOverridden).toBe(true);

    // Downstream Windows should auto-predict 5 days after new Roofing date -> Dec 07, 2025
    const windows = schedule.milestones.find((m) => m.code === "06.01");
    expect(windows?.targetDate).toBe("Dec 07, 2025");
    expect(windows?.isUserOverridden).toBe(false);

    // Drywall should auto-predict 5 days after Windows -> Dec 12, 2025
    const drywall = schedule.milestones.find((m) => m.code === "05.01");
    expect(drywall?.targetDate).toBe("Dec 12, 2025");
  });

  it("ensures zero negative delay days or malformed inputs crash the prediction engine", () => {
    const scheduleZero = predictTimelineSchedule(0);
    expect(scheduleZero.hvacTargetDate).toBe("Oct 20, 2025");
    expect(scheduleZero.interestCarry.formatted).toBe("+$0");

    const scheduleNegative = predictTimelineSchedule(-15);
    expect(scheduleNegative.hvacTargetDate).toBe("Oct 20, 2025");
    expect(scheduleNegative.interestCarry.formatted).toBe("+$0");
  });
});
