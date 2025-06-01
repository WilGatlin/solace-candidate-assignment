import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdvocateGrid from "@/components/AdvocateGrid";
import { Advocate } from "@/types/advocate";
import useSWRInfinite from "swr/infinite";


// ✅ Mock the SWR infinite hook
jest.mock("swr/infinite", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockSetSize = jest.fn();

const mockAdvocates: Advocate[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    city: "New York",
    degree: "MD",
    specialties: ["ADHD", "Nutrition"],
    yearsOfExperience: 5,
    phoneNumber: `1234567890`,
  },
];

describe("AdvocateGrid", () => {
  beforeEach(() => {
    (useSWRInfinite as jest.Mock).mockReturnValue({
      data: [{ data: mockAdvocates }],
      size: 1,
      setSize: mockSetSize,
      isValidating: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the grid and search bar", () => {
    render(<AdvocateGrid pageSize={10} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  it("clears search input when reset clicked", async () => {
    render(<AdvocateGrid pageSize={10} />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: "adhd" } });
    expect(input).toHaveValue("adhd");

    const resetButton = screen.getByRole("button");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });
});
