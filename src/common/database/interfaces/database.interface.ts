import { Document } from 'mongoose';

export interface IBaseEntity extends Document {
    _id: any;
    deleted: boolean;
    createdAt: Date;
    createdBy?: any;
    updatedAt: Date;
    updatedBy?: any;
    deletedAt?: Date;
    deletedBy?: any;
    __v: number;
}

export interface IPaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface IPaginationQuery {
    page?: number;
    limit?: number;
    search_key?: string;
    searchFields?: string[];
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    availableSortFields?: string[];
    defaultSortField?: string;
}

export interface IDatabaseQueryContainOptions {
    fullWord?: boolean;
}
