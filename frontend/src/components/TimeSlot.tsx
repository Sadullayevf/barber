import "../styles/components/TimeSlot.css";

type Props = {
  time: string;
  available: boolean;
  selected: boolean;
  onClick: () => void;
};

function TimeSlot({ time, available, selected, onClick }: Props) {
  return (
    <button
      className={`slot ${selected ? "selected" : ""}`}
      disabled={!available}
      onClick={onClick}
      type="button"
    >
      {time}
      {!available ? " (Booked)" : ""}
    </button>
  );
}

export default TimeSlot;
