"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST') || 'localhost',
    port: parseInt(configService.get('DB_PORT')) || 5432,
    username: configService.get('DB_USERNAME') || 'postgres',
    password: configService.get('DB_PASSWORD') || 'password',
    database: configService.get('DB_DATABASE') || 'hrm_db',
    entities: [__dirname + '/entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: configService.get('NODE_ENV') !== 'production',
    logging: configService.get('NODE_ENV') === 'development',
});
//# sourceMappingURL=data-source.js.map