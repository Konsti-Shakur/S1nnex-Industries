const API_URL = "https://DEIN-PROJEKT.vercel.app/api/order";

const form = document.getElementById("orderForm");
const message = document.getElementById("orderMessage");
const submitButton = document.getElementById("submitButton");

if (form) {
    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        message.className = "";
        message.textContent = "";

        submitButton.disabled = true;
        submitButton.textContent = "BESTELLUNG WIRD GESENDET...";

        const formData = new FormData(form);

        const data = {
            company: formData.get("company"),
            contact: formData.get("contact"),
            email: formData.get("email"),
            phone: formData.get("phone"),

            product: formData.get("product"),
            quantity: formData.get("quantity"),
            date: formData.get("date"),
            priority: formData.get("priority"),

            street: formData.get("street"),
            city: formData.get("city"),
            zip: formData.get("zip"),
            country: formData.get("country"),

            notes: formData.get("notes")
        };

        try {

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Die Bestellung konnte nicht gesendet werden."
                );
            }

            message.className = "success";

            message.innerHTML = `
                <strong>✓ Bestellung erfolgreich übermittelt.</strong>
                <br><br>
                Ihre Bestellnummer lautet:
                <strong>#${escapeHtml(result.orderId)}</strong>
            `;

            form.reset();

        } catch (error) {

            console.error(error);

            message.className = "error";

            message.textContent =
                error.message ||
                "Es ist ein Fehler aufgetreten.";
        }

        submitButton.disabled = false;
        submitButton.textContent = "BESTELLUNG ABSENDEN";
    });
}

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
