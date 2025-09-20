export interface JwtPayload {
    email: string;
    sub: string;
    sid: string;
}

export interface AuthenticatedUser {
    _id: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    address: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
