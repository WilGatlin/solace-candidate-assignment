import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdvocateCard from "@/components/AdvocateCard";

const advocate = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  city: "New York",
  degree: "MD",
  specialties: ["ADHD", "Nutrition", "Sleep"],
  yearsOfExperience: 5,
  phoneNumber: "5551234567",
};

describe("AdvocateCard", () => {
  it("renders advocate info correctly", () => {
    render(<AdvocateCard advocate={advocate} searchTerm="" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("(MD)")).toBeInTheDocument();
    expect(screen.getByText(/5 years experience/i)).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
    expect(screen.getByText("5551234567")).toBeInTheDocument();
  });

  it("shows only matching specialties when searchTerm is provided", () => {
    render(<AdvocateCard advocate={advocate} searchTerm="adhd" />);
    expect(screen.getByText("ADHD")).toBeInTheDocument();
    expect(screen.queryByText("Nutrition")).not.toBeInTheDocument();
    expect(screen.getByText("Show All Specialties")).toBeInTheDocument();
  });

  it("toggles to show all specialties when clicked", () => {
    render(<AdvocateCard advocate={advocate} searchTerm="adhd" />);
    const toggleBtn = screen.getByText("Show All Specialties");
    fireEvent.click(toggleBtn);
    expect(screen.getByText("Nutrition")).toBeInTheDocument();
    expect(screen.getByText("Show Relevant")).toBeInTheDocument();
  });
});
