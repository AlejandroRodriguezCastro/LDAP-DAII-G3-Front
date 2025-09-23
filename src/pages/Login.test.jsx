
import React from "react";
import Login from "./Login";
import { describe, it, expect } from "vitest";

describe("Login page", () => {
  it("renders without crashing", () => {
    const element = <Login />;
    expect(element).toBeDefined();
  });
});
