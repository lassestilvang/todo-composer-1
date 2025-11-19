import { describe, it, expect } from "bun:test";
import {
  formatDate,
  formatTime,
  isToday,
  isTomorrow,
  isOverdue,
  parseTimeToMinutes,
  formatMinutesToTime,
} from "./utils";

describe("Utils", () => {
  describe("formatDate", () => {
    it("should format a date correctly", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date);
      expect(formatted).toContain("Jan");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2024");
    });
  });

  describe("isToday", () => {
    it("should return true for today's date", () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it("should return false for yesterday", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe("isOverdue", () => {
    it("should return true for past dates", () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(isOverdue(past)).toBe(true);
    });

    it("should return false for future dates", () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      expect(isOverdue(future)).toBe(false);
    });
  });

  describe("parseTimeToMinutes", () => {
    it("should parse time string to minutes", () => {
      expect(parseTimeToMinutes("01:30")).toBe(90);
      expect(parseTimeToMinutes("02:15")).toBe(135);
      expect(parseTimeToMinutes("00:45")).toBe(45);
    });
  });

  describe("formatMinutesToTime", () => {
    it("should format minutes to time string", () => {
      expect(formatMinutesToTime(90)).toBe("01:30");
      expect(formatMinutesToTime(135)).toBe("02:15");
      expect(formatMinutesToTime(45)).toBe("00:45");
    });
  });
});
