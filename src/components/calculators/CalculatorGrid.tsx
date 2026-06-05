"use client";

import React from "react";
import TabbedInterestCalculator from "./TabbedInterestCalculator";
import LoanCalculator from "./LoanCalculator";
import DcfCalculator from "./DcfCalculator";
import BesSimulation from "./BesSimulation";
import BondValuation from "./BondValuation";

export default function CalculatorGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TabbedInterestCalculator />
      <LoanCalculator />
      <DcfCalculator />
      <BesSimulation />
      <BondValuation />
    </div>
  );
}
