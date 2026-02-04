"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface BusSeatLayoutProps {
  rows?: number;
  leftSeats?: number;
  rightSeats?: number;
  onSelectSeat: (seatNumber: number) => void;
  selectedSeatNumber?: number | null;
  bookedSeats?: string[];
  allSeats?: Array<{ id: number; seatNumber: string; position: string; status: string }>;
  onSeatHover?: (seatNumber: string | null) => void;
  hoveredSeat?: string | null;
  seatUserMap?: Record<string, { name: string; email: string }>;
}

export default function BusSeatLayout({
  rows = 8,
  leftSeats = 2,
  rightSeats = 3,
  onSelectSeat,
  selectedSeatNumber,
  bookedSeats = [],
  allSeats = [],
  onSeatHover,
  hoveredSeat,
  seatUserMap = {},
}: BusSeatLayoutProps) {
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="flex flex-col items-center gap-6 relative">
      <h2 className="text-xl font-semibold">Bus Seat Layout</h2>

      <div className="rounded-2xl bg-gray-100 p-6 shadow-lg relative">
        {/* Popup tooltip */}
        {hoveredSeat && seatUserMap[hoveredSeat] && popupPosition && (
          <div
            className="absolute bg-emerald-500 text-white rounded-lg p-2 shadow-lg z-50 text-sm font-bold whitespace-nowrap pointer-events-none"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              transform: "translate(-50%, -100%)",
              marginTop: "-8px",
            }}
          >
            <div className="font-bold">{seatUserMap[hoveredSeat].name}</div>
            <div className="text-xs">{seatUserMap[hoveredSeat].email}</div>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {(() => {
            // Sort all seats by their numeric value for proper ordering
            const sortedSeats = [...allSeats].sort((a, b) => {
              const numA = parseInt(a.seatNumber);
              const numB = parseInt(b.seatNumber);
              return numA - numB;
            });

            return Array.from({ length: rows }).map((_, rowIdx) => {
              // Get seats for this row from sorted seats
              const rowSeats = sortedSeats.slice(rowIdx * (leftSeats + rightSeats), (rowIdx + 1) * (leftSeats + rightSeats));
              
              if (rowSeats.length === 0) {
                // Fallback to computed seats if allSeats not provided
                let seatNumber = rowIdx * (leftSeats + rightSeats) + 1;
                return (
                  <div key={rowIdx} className="flex items-center gap-6">
                    {/* Left side seats */}
                    <div className="flex gap-3">
                      {Array.from({ length: leftSeats }).map(() => {
                        const current = seatNumber++;
                        const seatPos = current % 2 === 1 ? "L" : "R";
                        const seatStr = current.toString();
                        const seatWithPos = `${seatStr}${seatPos}`;
                        const isBooked = bookedSeats.includes(seatStr) || bookedSeats.includes(seatWithPos);
                        return (
                          <Seat
                            key={current}
                            number={current}
                            seatNumber={seatWithPos}
                            position={seatPos}
                            selected={selectedSeatNumber === current}
                            booked={isBooked}
                            onClick={() => !isBooked && onSelectSeat(current)}
                            onHover={onSeatHover}
                            onHoverPosition={setPopupPosition}
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
                        const seatStr = current.toString();
                        const seatWithPos = `${seatStr}${seatPos}`;
                        const isBooked = bookedSeats.includes(seatStr) || bookedSeats.includes(seatWithPos);
                        return (
                          <Seat
                            key={current}
                            number={current}
                            seatNumber={seatWithPos}
                            position={seatPos}
                            selected={selectedSeatNumber === current}
                            booked={isBooked}
                            onClick={() => !isBooked && onSelectSeat(current)}
                            onHover={onSeatHover}
                            onHoverPosition={setPopupPosition}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Group seats into left and right, maintaining order
              const leftSeatsRow = rowSeats.filter(s => s.position === "LEFT");
              const rightSeatsRow = rowSeats.filter(s => s.position === "RIGHT");

              return (
                <div key={rowIdx} className="flex items-center gap-6">
                  {/* Left side seats */}
                  <div className="flex gap-3">
                    {leftSeatsRow.map((seat) => {
                      const isBooked = bookedSeats.includes(seat.seatNumber);
                      const seatNum = parseInt(seat.seatNumber);
                      return (
                        <Seat
                          key={seat.id}
                          number={seatNum}
                          seatNumber={seat.seatNumber}
                          position={seat.position as string}
                          selected={selectedSeatNumber === seatNum}
                          booked={isBooked || seat.status === "BOOKED"}
                          onClick={() => !isBooked && seat.status === "AVAILABLE" && onSelectSeat(seatNum)}
                          onHover={onSeatHover}
                          onHoverPosition={setPopupPosition}
                        />
                      );
                    })}
                  </div>

                  {/* Aisle */}
                  <div className="w-8" />

                  {/* Right side seats */}
                  <div className="flex gap-3">
                    {rightSeatsRow.map((seat) => {
                      const isBooked = bookedSeats.includes(seat.seatNumber);
                      const seatNum = parseInt(seat.seatNumber);
                      return (
                        <Seat
                          key={seat.id}
                          number={seatNum}
                          seatNumber={seat.seatNumber}
                          position={seat.position as string}
                          selected={selectedSeatNumber === seatNum}
                          booked={isBooked || seat.status === "BOOKED"}
                          onClick={() => !isBooked && seat.status === "AVAILABLE" && onSelectSeat(seatNum)}
                          onHover={onSeatHover}
                          onHoverPosition={setPopupPosition}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
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
  position?: string;
  booked?: boolean;
  seatNumber?: string;
  onHover?: (seatNumber: string | null) => void;
  onHoverPosition?: (pos: { x: number; y: number } | null) => void;
}

function Seat({ number, selected, onClick, booked, seatNumber, onHover, onHoverPosition }: SeatProps) {
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (booked && seatNumber) {
      onHover?.(seatNumber);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const parent = (e.currentTarget as HTMLElement).parentElement?.parentElement?.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        onHoverPosition?.({
          x: rect.left - parentRect.left + rect.width / 2,
          y: rect.top - parentRect.top,
        });
      }
    }
  };

  const handleMouseLeave = () => {
    if (booked) {
      onHover?.(null);
      onHoverPosition?.(null);
    }
  };

  return (
    <motion.button
      whileHover={!booked ? { scale: 1.1 } : {}}
      whileTap={!booked ? { scale: 0.95 } : {}}
      onClick={!booked ? onClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`h-12 w-12 rounded-xl text-sm font-medium shadow-md transition-all
        ${booked
          ? "bg-gray-400 text-gray-600 cursor-not-allowed"
          : selected
          ? "bg-blue-600 text-white"
          : "bg-white hover:bg-blue-100"
        }`}
    >
      {number}
    </motion.button>
  );
}
