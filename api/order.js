export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Methode nicht erlaubt."
        });
    }

    const allowedOrigin =
        process.env.ALLOWED_ORIGIN || "*";

    res.setHeader(
        "Access-Control-Allow-Origin",
        allowedOrigin
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    const webhook =
        process.env.DISCORD_WEBHOOK_URL;

    if (!webhook) {
        console.error(
            "DISCORD_WEBHOOK_URL fehlt."
        );

        return res.status(500).json({
            message: "Server ist nicht korrekt konfiguriert."
        });
    }

    const body = req.body || {};

    const requiredFields = [
        "company",
        "contact",
        "email",
        "product",
        "quantity",
        "date",
        "street",
        "city",
        "zip"
    ];

    for (const field of requiredFields) {

        if (
            !body[field] ||
            String(body[field]).trim() === ""
        ) {
            return res.status(400).json({
                message:
                    `Pflichtfeld fehlt: ${field}`
            });
        }
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(body.email)) {

        return res.status(400).json({
            message: "Ungültige E-Mail-Adresse."
        });
    }

    const quantity =
        Number(body.quantity);

    if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 999999
    ) {

        return res.status(400).json({
            message: "Ungültige Menge."
        });
    }

    const orderId =
        createOrderId();

    const priorityMap = {
        normal: "🟢 Normal",
        hoch: "🟠 Hoch",
        dringend: "🔴 DRINGEND"
    };

    const priority =
        priorityMap[body.priority] ||
        "🟢 Normal";

    const embed = {

        title: "📦 Neue Bestellung",

        description:
            `Eine neue Bestellung wurde über das S1NNEX-Portal eingereicht.`,

        color: 0xD6A928,

        fields: [

            {
                name: "🆔 Bestellnummer",
                value: `#${orderId}`,
                inline: true
            },

            {
                name: "📊 Priorität",
                value: priority,
                inline: true
            },

            {
                name: "🏢 Unternehmen",
                value: safe(body.company),
                inline: true
            },

            {
                name: "👤 Ansprechpartner",
                value: safe(body.contact),
                inline: true
            },

            {
                name: "📧 E-Mail",
                value: safe(body.email),
                inline: true
            },

            {
                name: "📞 Telefon",
                value: safe(body.phone || "Nicht angegeben"),
                inline: true
            },

            {
                name: "📦 Produkt",
                value: safe(body.product),
                inline: true
            },

            {
                name: "🔢 Menge",
                value: String(quantity),
                inline: true
            },

            {
                name: "📅 Liefertermin",
                value: safe(body.date),
                inline: true
            },

            {
                name: "📍 Lieferadresse",
                value:
                    `${safe(body.street)}\n` +
                    `${safe(body.zip)} ${safe(body.city)}\n` +
                    `${safe(body.country || "Deutschland")}`,
                inline: false
            },

            {
                name: "📝 Hinweise",
                value:
                    safe(body.notes || "Keine zusätzlichen Angaben."),
                inline: false
            }

        ],

        footer: {
            text: "S1NNEX INDUSTRIES • Bestellsystem"
        },

        timestamp: new Date().toISOString()
    };

    try {

        const discordResponse =
            await fetch(webhook, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: "S1NNEX Bestellsystem",
                    embeds: [embed]
                })
            });

        if (!discordResponse.ok) {

            const errorText =
                await discordResponse.text();

            console.error(
                "Discord Fehler:",
                errorText
            );

            return res.status(502).json({
                message:
                    "Die Bestellung konnte momentan nicht an das interne System übermittelt werden."
            });
        }

        return res.status(200).json({
            success: true,
            orderId
        });

    } catch (error) {

        console.error(
            "Webhook Fehler:",
            error
        );

        return res.status(500).json({
            message:
                "Interner Serverfehler."
        });
    }
}


function createOrderId() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    const random =
        Math.floor(
            1000 + Math.random() * 9000
        );

    return `${year}${month}${day}-${random}`;
}


function safe(value) {

    return String(value)
        .trim()
        .slice(0, 1000);
}
