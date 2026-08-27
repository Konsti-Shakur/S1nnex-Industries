const API_URL =
    "https://DEIN-PROJEKT.vercel.app/api/order";


const prices = {

    "Eisenerz": 80,

    "Metall": 140,

    "Carbon": 120,

    "Eisen": 120,

    "Aramidfasern": 80,

    "Schutzplatten": 1200,

    "Hülsen": 80,

    "Schwarzpulver": 80

};


const form =
    document.getElementById("orderForm");

const productSelect =
    document.getElementById("product");

const quantityInput =
    document.getElementById("quantity");

const totalPrice =
    document.getElementById("totalPrice");

const message =
    document.getElementById("orderMessage");


/*
    Produkt automatisch aus dem Katalog übernehmen
*/

const params =
    new URLSearchParams(window.location.search);

const selectedProduct =
    params.get("product");


if (selectedProduct && productSelect) {

    productSelect.value =
        selectedProduct;

    updatePrice();

}


/*
    Preis berechnen
*/

function updatePrice() {

    if (!productSelect || !quantityInput) {
        return;
    }

    const product =
        productSelect.value;

    const quantity =
        Number(quantityInput.value) || 0;

    const price =
        prices[product] || 0;

    const total =
        price * quantity;


    totalPrice.textContent =
        total.toLocaleString("de-DE") + "$";

}


if (productSelect) {

    productSelect.addEventListener(
        "change",
        updatePrice
    );

}


if (quantityInput) {

    quantityInput.addEventListener(
        "input",
        updatePrice
    );

}


/*
    Bestellung absenden
*/

if (form) {

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            message.className =
                "order-message loading";

            message.textContent =
                "Bestellung wird übermittelt...";


            const data =
                new FormData(form);


            const order = {

                company:
                    data.get("company"),

                contact:
                    data.get("contact"),

                discord:
                    data.get("discord"),

                phone:
                    data.get("phone"),

                product:
                    data.get("product"),

                quantity:
                    Number(data.get("quantity")),

                deliveryDate:
                    data.get("deliveryDate"),

                address:
                    data.get("address"),

                notes:
                    data.get("notes")

            };


            try {

                const response =
                    await fetch(
                        API_URL,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(order)

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Fehler beim Absenden."
                    );

                }


                message.className =
                    "order-message success";


                message.innerHTML = `

                    <strong>
                        ✓ Bestellung erfolgreich
                    </strong>

                    <br><br>

                    Bestellnummer:
                    <strong>
                        ${result.orderNumber}
                    </strong>

                    <br>

                    Die Bestellung wurde an
                    die zuständige Fraktion übermittelt.

                `;


                form.reset();

                updatePrice();


            } catch (error) {

                console.error(error);


                message.className =
                    "order-message error";


                message.textContent =
                    "Die Bestellung konnte nicht übermittelt werden. Bitte versuche es erneut.";

            }

        }
    );

}
