export interface ApiResponse<T = any> {
    error: boolean;
    message: string;
    data?: T;
}

export interface ApiErrorResponse {
    error: true;
    message: string;
    data: {
        message: string;
        statusCode: number;
        timestamp: string;
        path: string;
        errors?: Array<{
            property: string;
            message: string;
        }>;
    };
}

export interface ApiSuccessResponse<T = any> {
    error: false;
    message: string;
    data: T;
}
