import { ArrowRight, CalendarDays } from "lucide-react";
import { formatDate, isValidDate, todayDate } from "../../utils/format";

interface Props {
  date: string;
  deliveryDate: string;
  onChange: (date: string) => void;
}

export function DateSelector({ date, deliveryDate, onChange }: Props) {
  return (
    <section className="date-panel" aria-label="Choose decision date">
      <div className="date-description">
        <span className="icon-tile">
          <CalendarDays size={21} />
        </span>
        <div>
          <h2>Your decision, in context</h2>
          <p>Choose when the purchase decision is made.</p>
        </div>
      </div>
      <div className="date-controls">
        <div>
          <label htmlFor="decision-date">Decision date</label>
          <div className="date-input-group">
            <input
              id="decision-date"
              type="date"
              value={date}
              onChange={(event) => {
                if (isValidDate(event.target.value))
                  onChange(event.target.value);
              }}
            />
            <button
              className="today-button"
              onClick={() => onChange(todayDate())}
            >
              Today
            </button>
          </div>
        </div>
        <ArrowRight size={19} className="date-arrow" />
        <div className="delivery-date">
          <span className="field-label">Delivery day</span>
          <strong>{formatDate(deliveryDate)}</strong>
          <span>Following day · UTC</span>
        </div>
      </div>
    </section>
  );
}
