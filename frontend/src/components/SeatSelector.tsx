import React, { useState } from 'react';
import { Seat } from '../types';
import '../styles/SeatSelector.css';

interface SeatSelectorProps {
  seats: Seat[];
  selectedSeats: string[];
  onSeatsSelect: (seats: string[]) => void;
  maxSeats?: number;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({
  seats,
  selectedSeats,
  onSeatsSelect,
  maxSeats = 10,
}) => {
  const toggleSeat = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      onSeatsSelect(selectedSeats.filter((s) => s !== seatNumber));
    } else if (selectedSeats.length < maxSeats) {
      onSeatsSelect([...selectedSeats, seatNumber]);
    }
  };

  // Group seats by row
  const seatsByRow: { [key: string]: Seat[] } = {};
  seats.forEach((seat) => {
    const row = seat.seat_number.charAt(0);
    if (!seatsByRow[row]) {
      seatsByRow[row] = [];
    }
    seatsByRow[row].push(seat);
  });

  return (
    <div className="seat-selector">
      <div className="legend">
        <div className="legend-item">
          <span className="seat available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="seat booked"></span>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <span className="seat selected"></span>
          <span>Selected</span>
        </div>
      </div>

      <div className="screen">🎬 Screen</div>

      <div className="seats-grid">
        {Object.entries(seatsByRow)
          .sort()
          .map(([row, rowSeats]) => (
            <div key={row} className="seat-row">
              <div className="row-label">{row}</div>
              {rowSeats
                .sort((a, b) => {
                  const numA = parseInt(a.seat_number.substring(1));
                  const numB = parseInt(b.seat_number.substring(1));
                  return numA - numB;
                })
                .map((seat) => (
                  <button
                    key={seat.id}
                    className={`seat ${seat.status} ${
                      selectedSeats.includes(seat.seat_number) ? 'selected' : ''
                    }`}
                    onClick={() => toggleSeat(seat.seat_number)}
                    disabled={seat.status !== 'available'}
                    title={`${seat.seat_number} - ${seat.status}`}
                  >
                    {seat.seat_number.substring(1)}
                  </button>
                ))}
            </div>
          ))}
      </div>

      <div className="selection-summary">
        <p>Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
        <p>Seats Remaining: {maxSeats - selectedSeats.length}</p>
      </div>
    </div>
  );
};

export default SeatSelector;
