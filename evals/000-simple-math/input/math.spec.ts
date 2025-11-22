import { test, expect } from "bun:test";
import { add, subtract, multiply, divide } from "./math";

test("add returns sum of two numbers", () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-1, 1)).toBe(0);
  expect(add(0, 0)).toBe(0);
  expect(add(10, -5)).toBe(5);
});

test("subtract returns difference of two numbers", () => {
  expect(subtract(5, 3)).toBe(2);
  expect(subtract(10, 10)).toBe(0);
  expect(subtract(0, 5)).toBe(-5);
  expect(subtract(-3, -1)).toBe(-2);
});

test("multiply returns product of two numbers", () => {
  expect(multiply(2, 3)).toBe(6);
  expect(multiply(5, 0)).toBe(0);
  expect(multiply(-2, 4)).toBe(-8);
  expect(multiply(-3, -3)).toBe(9);
});

test("divide returns quotient of two numbers", () => {
  expect(divide(6, 2)).toBe(3);
  expect(divide(10, 5)).toBe(2);
  expect(divide(9, 3)).toBe(3);
  expect(divide(-8, 2)).toBe(-4);
});

test("divide by zero returns undefined", () => {
  expect(divide(5, 0)).toBe(undefined);
});
