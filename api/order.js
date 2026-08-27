export default async function handler(req, res) {

    /*
        CORS
    */

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

        return res.status(200).end();

    }


    if (req.method !== "POST") {

        return res.status(405).json({

            message:
                "Methode nicht erlaubt."

        });

    }


    try {

        const {

            company,
            contact,
            discord,
            phone,
            product,
            quantity,
            deliveryDate,
            address,
            notes

        } = req.body;


        /*
            Pflichtfelder prüfen
        */

        if (
            !company ||
            !contact ||
            !discord ||
            !product ||
            !quantity ||
            !address
        ) {

            return res.status(400).json({

                message:
                    "Bitte alle Pflichtfelder ausfüllen."

            });

        }


        /*
            Produktpreise
        */

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


        if (!prices[product]) {

            return res.status(400).json({

                message:
                    "Ungültiges Produkt."

            });

        }


        /*
            Menge validieren
        */

        const amount =
            Number(quantity);


        if (
            !Number.isInteger(amount) ||
            amount < 1 ||
            amount > 100000
        ) {

            return res.status(400).json({

                message:
                    "Ungültige Menge."

            });

        }


        /*
            Preis serverseitig berechnen
        */

        const unitPrice =
            prices[product];


        const total =
            unitPrice * amount;


        /*
            Bestellnummer
        */

        const orderNumber =
            "S1-" +
            Date.now()
                .toString()
                .slice(-8);


        /*
            Discord Webhook aus Vercel
        */

        const webhook =
            process.env.DISCORD_WEBHOOK_URL;


        if (!webhook) {

            console.error(
                "DISCORD_WEBHOOK_URL fehlt."
            );

            return res.status(500).json({

                message:
                    "Bestellsystem ist momentan nicht konfiguriert."

            });

        }


        /*
            Discord Embed
        */

        const payload = {

            username:
                "S1NNEX INDUSTRIES",

            avatar_url:
                "https://cdn.discordapp.com/embed/avatars/0.png",

            embeds: [

                {

                    title:
                        "📦 NEUE BESTELLUNG",

                    description:
                        "Eine neue Bestellung wurde über das S1NNEX-Bestellsystem aufgegeben.",

                    color:
                        15105570,

                    fields: [

                        {
                            name:
                                "🆔 Bestellnummer",

                            value:
                                `\`${orderNumber}\``,

                            inline: true
                        },


                        {
                            name:
                                "🏢 Fraktion / Unternehmen",

                            value:
                                company,

                            inline: true
                        },


                        {
                            name:
                                "👤 Ansprechpartner",

                            value:
                                contact,

                            inline: true
                        },


                        {
                            name:
                                "💬 Discord",

                            value:
                                discord,

                            inline: true
                        },


                        {
                            name:
                                "📞 Ingame Kontakt",

                            value:
                                phone ||
                                "Nicht angegeben",

                            inline: true
                        },


                        {
                            name:
                                "📦 Produkt",

                            value:
                                product,

                            inline: true
                        },


                        {
                            name:
                                "🔢 Menge",

                            value:
                                amount.toLocaleString(
                                    "de-DE"
                                ),

                            inline: true
                        },


                        {
                            name:
                                "💵 Stückpreis",

                            value:
                                unitPrice.toLocaleString(
                                    "de-DE"
                                ) + "$",

                            inline: true
                        },


                        {
                            name:
                                "💰 Gesamtpreis",

                            value:
                                "**" +
                                total.toLocaleString(
                                    "de-DE"
                                ) +
                                "$**",

                            inline: true
                        },


                        {
                            name:
                                "📅 Lieferdatum",

                            value:
                                deliveryDate ||
                                "Nach Absprache",

                            inline: true
                        },


                        {
                            name:
                                "📍 Lieferort",

                            value:
                                address,

                            inline: false
                        },


                        {
                            name:
                                "📝 Hinweise",

                            value:
                                notes ||
                                "Keine zusätzlichen Angaben.",

                            inline: false
                        }

                    ],


                    footer: {

                        text:
                            "S1NNEX INDUSTRIES • Bestellsystem"

                    },


                    timestamp:
                        new Date().toISOString()

                }

            ]

        };


        /*
            Discord Anfrage
        */

        const discordResponse =
            await fetch(
                webhook,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(payload)

                }
            );


        if (!discordResponse.ok) {

            const errorText =
                await discordResponse.text();

            console.error(
                "Discord Error:",
                errorText
            );


            return res.status(502).json({

                message:
                    "Die Bestellung konnte nicht an Discord übermittelt werden."

            });

        }


        /*
            Erfolg
        */

        return res.status(200).json({

            success:
                true,

            orderNumber:
                orderNumber,

            total:
                total

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            message:
                "Interner Serverfehler."

        });

    }

}
