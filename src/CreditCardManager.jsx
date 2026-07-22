import { useMemo, useState } from "react";

const EMPTY_FORM = {
  cardholderName: "",
  cardNumber: "",
  expiration: "",
  securityCode: "",
  billingZip: "",
};

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(" ") || "";
}

function formatExpiration(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function validateExpiration(expiration) {
  const match = expiration.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = Number(`20${match[2]}`);
  const now = new Date();
  const expirationDate = new Date(year, month, 0, 23, 59, 59);

  return expirationDate >= now;
}

function maskCardNumber(cardNumber) {
  const lastFour = cardNumber.replace(/\D/g, "").slice(-4);
  return `•••• •••• •••• ${lastFour}`;
}

function CreditCardManager({
  cards,
  selectedCardId,
  setSelectedCardId,
  onSaveCard,
  onDeleteCard,
  cart,
  cartTotal,
  onBackToCart,
  onCompleteOrder,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId),
    [cards, selectedCardId]
  );

  function updateField(event) {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "cardNumber") {
      nextValue = formatCardNumber(value);
    }

    if (name === "expiration") {
      nextValue = formatExpiration(value);
    }

    if (name === "securityCode") {
      nextValue = value.replace(/\D/g, "").slice(0, 4);
    }

    if (name === "billingZip") {
      nextValue = value.replace(/[^0-9-]/g, "").slice(0, 10);
    }

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: nextValue,
    }));
    setFormError("");
    setSaveMessage("");
  }

  function saveCard(event) {
    event.preventDefault();

    if (formData.cardholderName.trim().length < 2) {
      setFormError("Enter the cardholder name.");
      return;
    }

    if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(formData.cardNumber)) {
      setFormError("Use the card number format 1234 5678 9012 3456.");
      return;
    }

    if (!validateExpiration(formData.expiration)) {
      setFormError("Enter a valid future expiration date in MM/YY format.");
      return;
    }

    if (!/^\d{3,4}$/.test(formData.securityCode)) {
      setFormError("Enter a three or four digit security code.");
      return;
    }

    if (!/^\d{5}(-\d{4})?$/.test(formData.billingZip)) {
      setFormError("Enter a valid five digit billing ZIP code.");
      return;
    }

    const savedCard = {
      id: globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : String(Date.now()),
      cardholderName: formData.cardholderName.trim(),
      cardNumber: formData.cardNumber,
      expiration: formData.expiration,
      billingZip: formData.billingZip,
      savedAt: new Date().toISOString(),
    };

    onSaveCard(savedCard);
    setFormData(EMPTY_FORM);
    setFormError("");
    setSaveMessage("Card saved to localStorage. The security code was not saved.");
  }

  return (
    <div className="checkout-layout">
      <section className="checkout-panel">
        <button className="text-button" type="button" onClick={onBackToCart}>
          Back to cart
        </button>

        <h1>Credit Card Management</h1>
        <p>
          Add a payment card, select a saved card, and review your order before
          completing checkout.
        </p>

        <div className="security-notice" role="note">
          <strong>Classroom demonstration only.</strong> Card information is
          stored in this browser because the assignment requires localStorage.
          A production application must use a PCI compliant payment provider.
        </div>

        <form className="card-form" onSubmit={saveCard} noValidate>
          <label>
            Cardholder name
            <input
              name="cardholderName"
              type="text"
              autoComplete="cc-name"
              value={formData.cardholderName}
              onChange={updateField}
              placeholder="Ben Holley"
            />
          </label>

          <label className="full-width">
            Card number
            <input
              name="cardNumber"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              value={formData.cardNumber}
              onChange={updateField}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
            />
          </label>

          <label>
            Expiration
            <input
              name="expiration"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              value={formData.expiration}
              onChange={updateField}
              placeholder="MM/YY"
              maxLength="5"
            />
          </label>

          <label>
            Security code
            <input
              name="securityCode"
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              value={formData.securityCode}
              onChange={updateField}
              placeholder="123"
              maxLength="4"
            />
            <span className="field-help">Never saved to localStorage</span>
          </label>

          <label>
            Billing ZIP code
            <input
              name="billingZip"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              value={formData.billingZip}
              onChange={updateField}
              placeholder="42101"
              maxLength="10"
            />
          </label>

          <div className="full-width">
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            {saveMessage && (
              <p className="success-message" role="status">
                {saveMessage}
              </p>
            )}

            <button className="primary-button" type="submit">
              Save Card
            </button>
          </div>
        </form>

        <section className="saved-cards" aria-labelledby="saved-cards-heading">
          <h2 id="saved-cards-heading">Saved Cards</h2>

          {cards.length === 0 ? (
            <p>No payment cards have been saved.</p>
          ) : (
            cards.map((card) => (
              <article
                className={`saved-card ${
                  selectedCardId === card.id ? "selected-card" : ""
                }`}
                key={card.id}
              >
                <label className="saved-card-choice">
                  <input
                    type="radio"
                    name="selectedCard"
                    checked={selectedCardId === card.id}
                    onChange={() => setSelectedCardId(card.id)}
                  />
                  <span>
                    <strong>{card.cardholderName}</strong>
                    <span>{maskCardNumber(card.cardNumber)}</span>
                    <span>Expires {card.expiration}</span>
                  </span>
                </label>

                <button
                  className="danger-button"
                  type="button"
                  onClick={() => onDeleteCard(card.id)}
                >
                  Delete
                </button>
              </article>
            ))
          )}
        </section>
      </section>

      <aside className="order-summary" aria-labelledby="order-summary-heading">
        <h2 id="order-summary-heading">Order Summary</h2>

        {cart.map((item) => (
          <div className="order-line" key={item.id}>
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}

        <div className="order-total">
          <span>Total</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>

        <button
          className="primary-button checkout-button"
          type="button"
          disabled={!selectedCard || cart.length === 0}
          onClick={onCompleteOrder}
        >
          Complete Order
        </button>

        {!selectedCard && cards.length > 0 && (
          <p className="field-help">Select a saved card to continue.</p>
        )}
      </aside>
    </div>
  );
}

export default CreditCardManager;
