import { FormEvent } from "react";
import { Barber, Service } from "../services/api";
import "../styles/components/BookingForm.css";

type Props = {
  selectedBarber?: Barber;
  selectedService?: Service;
  date: string;
  time: string;
  customerName: string;
  phone: string;
  loading: boolean;
  onChangeDate: (value: string) => void;
  onChangeName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

function BookingForm({
  selectedBarber,
  selectedService,
  date,
  time,
  customerName,
  phone,
  loading,
  onChangeDate,
  onChangeName,
  onChangePhone,
  onSubmit,
}: Props) {
  return (
    <form className="booking-form" onSubmit={onSubmit}>
      <h2>Booking Details</h2>
      <label>
        Date
        <input type="date" value={date} onChange={(e) => onChangeDate(e.target.value)} required />
      </label>
      <label>
        Full Name
        <input
          type="text"
          value={customerName}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </label>
      <label>
        Phone
        <input
          type="tel"
          value={phone}
          onChange={(e) => onChangePhone(e.target.value)}
          placeholder="Enter phone number"
          required
        />
      </label>

      <div className="booking-summary">
        <h3>Summary</h3>
        <p>Barber: {selectedBarber?.name || "Not selected"}</p>
        <p>Service: {selectedService?.name || "Not selected"}</p>
        <p>Date: {date || "Not selected"}</p>
        <p>Time: {time || "Not selected"}</p>
      </div>

      <button type="submit" disabled={loading || !selectedBarber || !selectedService || !date || !time}>
        {loading ? "Booking..." : "Confirm Booking"}
      </button>
    </form>
  );
}

export default BookingForm;
