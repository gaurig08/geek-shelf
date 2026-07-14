import { describe, it, expect } from "vitest";
import { getAuthErrorMessage } from "../getAuthErrorMessage";

describe("getAuthErrorMessage", () => {
  it("maps known Firebase error codes to friendly text", () => {
    expect(getAuthErrorMessage({ code: "auth/wrong-password" })).toBe(
      "Incorrect password. Please try again."
    );
    expect(getAuthErrorMessage({ code: "auth/email-already-in-use" })).toBe(
      "An account with this email already exists."
    );
  });

  it("falls back to a generic message for unknown codes", () => {
    expect(getAuthErrorMessage({ code: "auth/some-new-error" })).toBe(
      "Something went wrong. Please try again."
    );
  });

  it("handles a missing or malformed error object without throwing", () => {
    expect(getAuthErrorMessage(undefined)).toBe("Something went wrong. Please try again.");
    expect(getAuthErrorMessage({})).toBe("Something went wrong. Please try again.");
  });
});
