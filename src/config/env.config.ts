import dotenv from "dotenv";

dotenv.config();

interface ConfigType {
	PORT: number;
	DB_URL: string;
}

const config: ConfigType = {
	PORT: Number(process.env.PORT) || 3000,
	DB_URL: process.env.DB_URL,
};

export default config;
