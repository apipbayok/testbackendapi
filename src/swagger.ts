import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {

    definition: {
        openapi: "3.0.0",
        info: {
            title: "TakeHome Test Backend API",
            version: "1.0.0",
            description:"Apip",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        "./src/routes/*.ts",
    ],
};
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;