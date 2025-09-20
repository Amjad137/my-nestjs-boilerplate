import AppConfig from '@configs/app.config';
import AuthConfig from '@configs/auth.config';
import AwsConfig from '@configs/aws.config';
import DatabaseConfig from '@configs/database.config';
import MiddlewareConfig from '@configs/middleware.config';

export default [
    AppConfig,
    DatabaseConfig,
    AuthConfig,
    MiddlewareConfig,
    AwsConfig,
];
