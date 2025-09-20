import {
    Model,
    PopulateOptions,
    RootFilterQuery,
    UpdateQuery,
    Types,
    PipelineStage,
} from 'mongoose';
import { BaseEntity } from '@common/database/bases/base.entity';
import {
    IBaseEntity,
    IPaginationResult,
    IPaginationQuery,
} from '@common/database/interfaces/database.interface';

export interface IDatabaseFindAllOptions {
    select?: Record<string, any>;
    paging?: {
        limit: number;
        offset: number;
    };
    order?: Record<string, any>;
    join?: boolean | PopulateOptions | (string | PopulateOptions)[];
    withDeleted?: boolean;
    session?: any;
}

export interface IDatabaseFindOneOptions {
    select?: Record<string, any>;
    join?: boolean | PopulateOptions | (string | PopulateOptions)[];
    withDeleted?: boolean;
    session?: any;
}

export interface IDatabaseCreateOptions {
    session?: any;
}

export interface IDatabaseUpdateOptions {
    session?: any;
}

export interface IDatabaseSoftDeleteOptions {
    session?: any;
}

export interface IDatabaseDeleteOptions {
    session?: any;
}

export class BaseRepository<
    Entity extends BaseEntity,
    EntityDocument extends IBaseEntity,
> {
    protected readonly _repository: Model<Entity>;
    readonly _join?: PopulateOptions | (string | PopulateOptions)[];

    constructor(
        repository: Model<Entity>,
        options?: PopulateOptions | (string | PopulateOptions)[],
    ) {
        this._repository = repository;
        this._join = options;
    }

    // Single findAll method - handles everything intelligently
    async findAll<T = EntityDocument>(
        find?: RootFilterQuery<Entity>,
        options?: IDatabaseFindAllOptions & {
            // Pagination options
            paginationQuery?: IPaginationQuery;
            searchFields?: string[];
            availableSortFields?: string[];
            defaultSortField?: string;
        },
    ): Promise<T[] | IPaginationResult<T>> {
        // Check if pagination is requested
        const isPaginated =
            options?.paginationQuery &&
            (options.paginationQuery.page !== undefined ||
                options.paginationQuery.limit !== undefined ||
                options.paginationQuery.search_key !== undefined ||
                options.paginationQuery.sort_by !== undefined ||
                options.paginationQuery.sort_order !== undefined);

        // Build base filter
        const baseFilter: any = {
            ...find,
            ...(!options?.withDeleted && { deleted: false }),
        };

        // Add search if provided
        if (options?.paginationQuery?.search_key && options?.searchFields) {
            baseFilter.$or = options.searchFields.map(field => ({
                [field]: {
                    $regex: options.paginationQuery.search_key,
                    $options: 'i',
                },
            }));
        }

        // If no pagination, return simple results
        if (!isPaginated) {
            let query = this._repository.find(baseFilter);

            if (options?.select) query = query.select(options.select);
            if (options?.order) query = query.sort(options.order);
            if (options?.join) {
                const populateOptions =
                    typeof options.join === 'boolean' && options.join
                        ? this._join
                        : options.join;
                if (populateOptions && typeof populateOptions !== 'boolean') {
                    query = query.populate(populateOptions);
                }
            }
            if (options?.session) query = query.session(options.session);

            return query.exec() as Promise<T[]>;
        }

        // Handle pagination
        const { page = 1, limit = 20 } = options.paginationQuery;
        const skip = (page - 1) * limit;

        // Build sort
        const sortField = options?.availableSortFields?.includes(
            options?.paginationQuery?.sort_by || '',
        )
            ? options?.paginationQuery?.sort_by
            : options?.defaultSortField || 'createdAt';
        const sortOrder: 1 | -1 =
            options?.paginationQuery?.sort_order === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        // Use simple Mongoose pagination with populate
        const total = await this._repository.countDocuments(baseFilter);

        let query = this._repository
            .find(baseFilter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Add population if join is enabled
        if (options?.join) {
            const populateOptions =
                typeof options.join === 'boolean' && options.join
                    ? this._join
                    : options.join;

            if (populateOptions && typeof populateOptions !== 'boolean') {
                query = query.populate(populateOptions);
            }
        }

        const data = await query.exec();

        return {
            data: data as T[],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        };
    }

    // Find one document
    async findOne<T = EntityDocument>(
        find: RootFilterQuery<Entity>,
        options?: IDatabaseFindOneOptions,
    ): Promise<T> {
        const resolvedFind = await Promise.resolve(find || {});
        const finalFind = {
            ...resolvedFind,
            ...(!options?.withDeleted && {
                deleted: false,
            }),
        };
        const repository = this._repository.findOne<T>(finalFind);

        if (options?.select) {
            repository.select(options.select);
        }

        if (options?.join) {
            repository.populate(
                (typeof options.join === 'boolean' && options.join
                    ? this._join
                    : options.join) as
                    | PopulateOptions
                    | (string | PopulateOptions)[],
            );
        }

        if (options?.session) {
            repository.session(options.session);
        }

        return repository.exec();
    }

    // Find by ID
    async findOneById<T = EntityDocument>(
        _id: Types.ObjectId,
        options?: IDatabaseFindOneOptions,
    ): Promise<T> {
        return this.findOne<T>({ _id } as RootFilterQuery<Entity>, options);
    }

    // Create document
    async create<T = EntityDocument>(
        data: Partial<Entity>,
        options?: IDatabaseCreateOptions,
    ): Promise<T> {
        const document = new this._repository(data);

        if (options?.session) {
            document.$session(options.session);
        }

        return document.save() as Promise<T>;
    }

    // Update document
    async updateOne<T = EntityDocument>(
        find: RootFilterQuery<Entity> | Promise<RootFilterQuery<Entity>>,
        data: UpdateQuery<Entity>,
        options?: IDatabaseUpdateOptions,
    ): Promise<T> {
        const resolvedFind = await Promise.resolve(find || {});
        const finalFind = {
            ...resolvedFind,
            deleted: false,
        };
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };
        const updateQuery = this._repository.findOneAndUpdate(
            finalFind,
            updateData,
            { new: true },
        );

        if (options?.session) {
            updateQuery.session(options.session);
        }

        return updateQuery.exec() as Promise<T>;
    }

    // Update by ID
    async updateOneById<T = EntityDocument>(
        _id: Types.ObjectId,
        data: UpdateQuery<Entity>,
        options?: IDatabaseUpdateOptions,
    ): Promise<T> {
        return this.updateOne<T>(
            { _id } as RootFilterQuery<Entity>,
            data,
            options,
        );
    }

    // Soft delete
    async softDelete<T = EntityDocument>(
        find: RootFilterQuery<Entity> | Promise<RootFilterQuery<Entity>>,
        deletedBy?: string | Types.ObjectId,
        options?: IDatabaseSoftDeleteOptions,
    ): Promise<T> {
        const resolvedFind = await Promise.resolve(find || {});
        const finalFind = {
            ...resolvedFind,
            deleted: false,
        };
        const updateData = {
            deleted: true,
            deletedAt: new Date(),
            ...(deletedBy && { deletedBy }),
        };
        const updateQuery = this._repository.findOneAndUpdate(
            finalFind,
            updateData,
            { new: true },
        );

        if (options?.session) {
            updateQuery.session(options.session);
        }

        return updateQuery.exec() as Promise<T>;
    }

    // Soft delete by ID
    async softDeleteOneById<T = EntityDocument>(
        _id: Types.ObjectId,
        deletedBy?: string | Types.ObjectId,
        options?: IDatabaseSoftDeleteOptions,
    ): Promise<T> {
        return this.softDelete<T>(
            { _id } as RootFilterQuery<Entity>,
            deletedBy,
            options,
        );
    }

    // Hard delete
    async delete(
        find: RootFilterQuery<Entity>,
        options?: IDatabaseDeleteOptions,
    ): Promise<boolean> {
        const deleteQuery = this._repository.deleteOne(find);

        if (options?.session) {
            deleteQuery.session(options.session);
        }

        const result = await deleteQuery.exec();
        return result.deletedCount > 0;
    }
    async deleteMany(
        find: RootFilterQuery<Entity>,
        options?: IDatabaseDeleteOptions,
    ): Promise<boolean> {
        const deleteQuery = this._repository.deleteMany(find);
        if (options?.session) {
            deleteQuery.session(options.session);
        }
        const result = await deleteQuery.exec();
        return result.deletedCount > 0;
    }
    // Hard delete by ID
    async deleteOneById(
        _id: Types.ObjectId,
        options?: IDatabaseDeleteOptions,
    ): Promise<boolean> {
        return this.delete({ _id } as RootFilterQuery<Entity>, options);
    }

    // Count documents
    async count(
        find?: RootFilterQuery<Entity> | Promise<RootFilterQuery<Entity>>,
        withDeleted?: boolean,
    ): Promise<number> {
        const resolvedFind = await Promise.resolve(find || {});
        return this._repository
            .countDocuments({
                ...resolvedFind,
                ...(!withDeleted && {
                    deleted: false,
                }),
            })
            .exec();
    }

    // Check if document exists
    async exists(
        find: RootFilterQuery<Entity>,
        withDeleted?: boolean,
    ): Promise<boolean> {
        const count = await this.count(find, withDeleted);
        return count > 0;
    }
}
