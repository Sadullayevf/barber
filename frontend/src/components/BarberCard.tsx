import { Barber } from "../services/api";
import "../styles/components/BarberCard.css";

type Props = {
  barber: Barber;
  selected?: boolean;
  onClick?: () => void;
};

function BarberCard({ barber, selected, onClick }: Props) {
  return (
    <button className={`barber-card ${selected ? "selected" : ""}`} onClick={onClick} type="button">
      <img src={barber.image} alt={barber.name} className="card-image" />
      <div className="card-content">
        <h3>{barber.name}</h3>
        <p>{barber.specialization}</p>
        <p>Experience: {barber.experience}</p>
        <p>Rating: {barber.rating.toFixed(1)} / 5</p>
      </div>
    </button>
  );
}

export default BarberCard;
