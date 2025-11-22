import { test, expect } from "bun:test";
import { add, subtract, multiply, divide } from "./math";

test("add returns sum of two numbers", () => {
  expect(add(2, 3)).toBe(5);
});

test("subtract returns difference of two numbers", () => {
  expect(subtract(5, 3)).toBe(2);
});

test("multiply returns product of two numbers", () => {
  expect(multiply(2, 3)).toBe(6);
});

test("divide returns quotient of two numbers", () => {
  expect(divide(6, 2)).toBe(3);
});

test("divide by zero returns undefined", () => {
  expect(divide(5, 0)).toBe(undefined);
});
