"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface BusSeatLayoutProps {
  rows?: number;
  leftSeats?: number;
  rightSeats?: number;
  onSelectSeat: (seatNumber: number) => void;
  selectedSeatNumber?: number | null;
}

export default function BusSeatLayout({
  rows = 8,
  leftSeats = 2,
  rightSeats = 3,
  onSelectSeat,
  selectedSeatNumber,
}: BusSeatLayoutProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold">Bus Seat Layout</h2>

      <div className="rounded-2xl bg-gray-100 p-6 shadow-lg">
        <div className="flex flex-col gap-4">
          {Array.from({ length: rows }).map((_, rowIdx) => {
            let seatNumber = rowIdx * (leftSeats + rightSeats) + 1;
            return (
              <div key={rowIdx} className="flex items-center gap-6">
                {/* Left side seats */}
                <div className="flex gap-3">
                  {Array.from({ length: leftSeats }).map(() => {
                    const current = seatNumber++;
                    const seatPos = current % 2 === 1 ? "L" : "R";
                    return (
                      <Seat
                        key={current}
                        number={current}
                        position={seatPos}
                        selected={selectedSeatNumber === current}
                        onClick={() => onSelectSeat(current)}
                      />
                    );
                  })}
                </div>

                {/* Aisle */}
                <div className="w-8" />

                {/* Right side seats */}
                <div className="flex gap-3">
                  {Array.from({ length: rightSeats }).map(() => {
                    const current = seatNumber++;
                    const seatPos = "R";
                    return (
                      <Seat
                        key={current}
                        number={current}
                        position={seatPos}
                        selected={selectedSeatNumber === current}
                        onClick={() => onSelectSeat(current)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedSeatNumber && (
        <div className="text-sm text-blue-600 font-medium">
          Selected seat: {selectedSeatNumber}
        </div>
      )}
    </div>
  );
}

interface SeatProps {
  number: number;
  selected: boolean;
  onClick: () => void;
}

function Seat({ number, selected, onClick }: SeatProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`h-12 w-12 rounded-xl text-sm font-medium shadow-md transition-all
        ${
          selected
            ? "bg-blue-600 text-white"
            : "bg-white hover:bg-blue-100"
        }`}
    >
      {number}
    </motion.button>
  );
}
