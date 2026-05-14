import { Service } from "../services/api";
import "../styles/components/ServiceCard.css";

type Props = {
  service: Service;
  selected?: boolean;
  onClick?: () => void;
};

function ServiceCard({ service, selected, onClick }: Props) {
  return (
    <button className={`service-card ${selected ? "selected" : ""}`} onClick={onClick} type="button">
      <div className="card-content">
        <h3>{service.name}</h3>
        <p>Duration: {service.duration} min</p>
        <p>Price: ${service.price.toFixed(2)}</p>
      </div>
    </button>
  );
}

export default ServiceCard;
