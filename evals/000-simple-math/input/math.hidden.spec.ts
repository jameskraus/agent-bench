import { test, expect } from "bun:test";
import { add, subtract, multiply, divide } from "./math";

test("add handles negative numbers", () => {
  expect(add(-5, -3)).toBe(-8);
});

test("subtract handles negative results", () => {
  expect(subtract(3, 10)).toBe(-7);
});

test("multiply handles zero", () => {
  expect(multiply(7, 0)).toBe(0);
});

test("divide handles negative numbers", () => {
  expect(divide(-10, 2)).toBe(-5);
});
