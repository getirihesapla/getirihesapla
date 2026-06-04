"use client";

import React from "react";
import UnifiedInterestCalculator from "./UnifiedInterestCalculator";
import LoanCalculator from "./LoanCalculator";
import GordonGrowth from "./GordonGrowth";
import RealReturn from "./RealReturn";
import BesSimulation from "./BesSimulation";
import BondValuation from "./BondValuation";

export default function CalculatorGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UnifiedInterestCalculator />
      <LoanCalculator />
      <GordonGrowth />
      <RealReturn />
      <BesSimulation />
      <BondValuation />
    </div>
  );
}
