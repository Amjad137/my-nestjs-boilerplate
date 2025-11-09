import {
    Model,
    PopulateOptions,
    RootFilterQuery,
    UpdateQuery,
    Types,
    PipelineStage,
    FilterQuery,
    ProjectionType,
} from 'mongoose';
import { BaseEntity } from '@common/database/bases/base.entity';
import {
    IBaseEntity,
    IPaginationResult,
    IPaginationQuery,
} from '@common/database/interfaces/database.interface';

export interface IDatabaseFindAllOptions<T = any> {
    select?: ProjectionType<T>;
    paging?: {
        limit: number;
        offset: number;
    };
    order?: Record<string, 1 | -1>;
    join?: boolean | PopulateOptions | (string | PopulateOptions)[];
    withDeleted?: boolean;
    session?: any;
    searchCriteria?: { key: string; value: string }[];
    lookup?: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
    }[];
}

export interface IDatabaseFindOneOptions<T = any> {
    select?: ProjectionType<T>;
    join?: boolean | PopulateOptions | (string | PopulateOptions)[];
    withDeleted?: boolean;
    session?: any;
    lean?: boolean;
}

export interface IDatabaseCreateOptions {
    session?: any;
}

export interface IDatabaseUpdateOptions {
    session?: any;
    returnDocument?: 'before' | 'after';
}

export interface IDatabaseSoftDeleteOptions {
    session?: any;
}

export interface IDatabaseDeleteOptions {
    session?: any;
    returnDocument?: 'before' | 'after';
}

export interface GroupedCount {
    [key: string]: number;
}

export interface TotalCount {
    totalCount: number;
}

export type CountResult = GroupedCount[] | TotalCount;

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

    async findAll<T = EntityDocument>(
        filter?: FilterQuery<Entity>,
        options?: IDatabaseFindAllOptions & {
            paginationQuery?: IPaginationQuery;
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
        const baseFilter: FilterQuery<Entity> = {
            ...filter,
            ...(!options?.withDeleted && { deleted: false }),
        };

        // Handle date range filters
        if (filter.createdAt) {
            const { $gte, $lte } = filter.createdAt;
            if ($gte || $lte) {
                baseFilter.createdAt = {
                    ...(baseFilter.createdAt as Record<string, unknown>),
                    ...($gte && { $gte: new Date($gte) }),
                    ...($lte && { $lt: new Date($lte) }),
                };
            }
        }

        // If no pagination, return simple results
        if (!isPaginated) {
            const query = this._repository.find(baseFilter).lean();

            if (options?.select) query.select(options.select);
            if (options?.order) query.sort(options.order);
            if (options?.join) {
                const populateOptions =
                    typeof options.join === 'boolean' && options.join
                        ? this._join
                        : options.join;
                if (populateOptions && typeof populateOptions !== 'boolean') {
                    query.populate(populateOptions);
                }
            }
            if (options?.session) query.session(options.session);

            const result = await query.exec();
            return (result ?? []) as T[];
        }

        // Handle pagination with aggregation
        const { page = 1, limit = 20 } = options.paginationQuery;
        const skip = (page - 1) * limit;

        // Build sort
        const sortField =
            options?.paginationQuery?.availableSortFields?.includes(
                options?.paginationQuery?.sort_by || '',
            )
                ? options?.paginationQuery?.sort_by
                : options?.paginationQuery?.defaultSortField || 'createdAt';
        const sortOrder: 1 | -1 =
            options?.paginationQuery?.sort_order === 'asc' ? 1 : -1;

        // Build aggregation pipeline
        const searchPipelines: PipelineStage[] = [];
        const paginationPipelines: PipelineStage.FacetPipelineStage[] = [
            { $sort: { [sortField]: sortOrder } },
            { $skip: skip },
            { $limit: limit },
        ];

        // Add base filter
        searchPipelines.push({ $match: baseFilter });

        // Add search criteria
        if (
            options?.paginationQuery?.search_key &&
            options?.paginationQuery?.searchFields
        ) {
            const searchConditions = options.paginationQuery.searchFields.map(
                field => ({
                    [field]: {
                        $regex: options.paginationQuery.search_key,
                        $options: 'i',
                    },
                }),
            );
            searchPipelines.push({ $match: { $or: searchConditions } });
        }

        // Add custom search criteria
        if (options?.searchCriteria?.length) {
            const searchConditions = options.searchCriteria.map(criteria => ({
                [criteria.key]: {
                    $regex: criteria.value,
                    $options: 'i',
                },
            }));
            searchPipelines.push({ $match: { $or: searchConditions } });
        }

        // Add lookups
        if (options?.lookup?.length) {
            for (const lookup of options.lookup) {
                searchPipelines.push({ $lookup: lookup });
                searchPipelines.push({
                    $unwind: {
                        path: `$${lookup.as}`,
                        preserveNullAndEmptyArrays: true,
                    },
                });
            }
        }

        // Add population if join is enabled
        if (options?.join) {
            const populateOptions =
                typeof options.join === 'boolean' && options.join
                    ? this._join
                    : options.join;

            if (populateOptions && Array.isArray(populateOptions)) {
                for (const populate of populateOptions) {
                    // Only handle PopulateOptions objects (not strings)
                    if (typeof populate === 'string' || !populate.model) {
                        continue;
                    }

                    // Get the actual collection name from the model
                    const modelName =
                        typeof populate.model === 'string'
                            ? populate.model
                            : populate.model.modelName;
                    const model = this._repository.db.model(modelName);
                    const collectionName = model.collection.name;

                    searchPipelines.push(
                        {
                            $lookup: {
                                from: collectionName,
                                localField: populate.path,
                                foreignField: '_id',
                                as: populate.path,
                            },
                        },
                        {
                            $unwind: {
                                path: `$${populate.path}`,
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    );

                    // Apply field selection if specified (expects array of strings)
                    if (populate.select && Array.isArray(populate.select)) {
                        const fieldProjection: Record<string, string> = {
                            _id: `$${populate.path}._id`,
                        };

                        for (const field of populate.select) {
                            fieldProjection[field] =
                                `$${populate.path}.${field}`;
                        }

                        searchPipelines.push({
                            $addFields: {
                                [populate.path]: {
                                    $cond: [
                                        { $ne: [`$${populate.path}`, null] },
                                        fieldProjection,
                                        null,
                                    ],
                                },
                            },
                        });
                    }
                }
            }
        }

        // Build final aggregation pipeline
        const pipeline: PipelineStage[] = [
            ...searchPipelines,
            {
                $facet: {
                    results: paginationPipelines,
                    extras: [{ $count: 'total' }],
                },
            },
            {
                $unwind: {
                    path: '$extras',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    results: 1,
                    extras: {
                        $ifNull: ['$extras', { total: 0 }],
                    },
                },
            },
            {
                $addFields: {
                    extras: {
                        total: '$extras.total',
                        limit: limit,
                        skip: skip,
                    },
                },
            },
        ];

        const result = await this._repository.aggregate(pipeline).exec();
        const data = result[0]?.results || [];
        const total = result[0]?.extras?.total || 0;

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
        filter: FilterQuery<Entity>,
        options?: IDatabaseFindOneOptions,
    ): Promise<T | undefined> {
        const finalFilter: FilterQuery<Entity> = {
            ...(filter || {}),
            ...(!options?.withDeleted && {
                deleted: false,
            }),
        };

        const query = this._repository.findOne(finalFilter);

        if (options?.lean !== false) {
            query.lean();
        }

        if (options?.select) {
            query.select(options.select);
        }

        if (options?.join) {
            const populateOptions =
                typeof options.join === 'boolean' && options.join
                    ? this._join
                    : options.join;
            if (populateOptions && typeof populateOptions !== 'boolean') {
                query.populate(populateOptions);
            }
        }

        if (options?.session) {
            query.session(options.session);
        }

        const result = await query.exec();
        return (result ?? undefined) as T | undefined;
    }

    // Find by ID
    async findOneById<T = EntityDocument>(
        _id: Types.ObjectId | string,
        options?: IDatabaseFindOneOptions,
    ): Promise<T | undefined> {
        const objectId =
            typeof _id === 'string' ? new Types.ObjectId(_id) : _id;
        return await this.findOne<T>(
            { _id: objectId } as FilterQuery<Entity>,
            options,
        );
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

        const result = await document.save();
        return result as T;
    }

    // Create many documents
    async createMany<T = EntityDocument>(
        data: Partial<Entity>[],
        options?: IDatabaseCreateOptions,
    ): Promise<T[]> {
        const result = await this._repository.insertMany(data, {
            ordered: true,
            rawResult: false,
            ...(options?.session && { session: options.session }),
        });
        return result as T[];
    }

    // Update document
    async updateOne<T = EntityDocument>(
        filter: FilterQuery<Entity>,
        data: UpdateQuery<Entity>,
        options?: IDatabaseUpdateOptions,
    ): Promise<T | undefined> {
        const finalFilter: FilterQuery<Entity> = {
            ...(filter || {}),
            deleted: false,
        };
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };

        const updateQuery = this._repository.findOneAndUpdate(
            finalFilter,
            updateData,
            {
                new: true,
                returnDocument: options?.returnDocument || 'after',
                ...(options?.session && { session: options.session }),
            },
        );

        const result = await updateQuery.exec();
        return (result ?? undefined) as T | undefined;
    }

    // Update by ID
    async updateOneById<T = EntityDocument>(
        _id: Types.ObjectId | string,
        data: UpdateQuery<Entity>,
        options?: IDatabaseUpdateOptions,
    ): Promise<T | undefined> {
        const objectId =
            typeof _id === 'string' ? new Types.ObjectId(_id) : _id;
        return await this.updateOne<T>(
            { _id: objectId } as FilterQuery<Entity>,
            data,
            options,
        );
    }

    // Update many documents
    async updateMany<T = EntityDocument>(
        filter: FilterQuery<Entity>,
        data: UpdateQuery<Entity>,
        options?: IDatabaseUpdateOptions,
    ): Promise<number> {
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };

        const result = await this._repository.updateMany(filter, updateData, {
            ...(options?.session && { session: options.session }),
        });

        return result.modifiedCount;
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
        filter?: FilterQuery<Entity>,
        withDeleted?: boolean,
    ): Promise<number> {
        const result = await this._repository
            .countDocuments({
                ...(filter || {}),
                ...(!withDeleted && {
                    deleted: false,
                }),
            })
            .exec();
        return result;
    }

    // Get document counts with grouping
    async getDocumentCounts(
        groupByField?: string,
        additionalFilters: Record<string, unknown> = {},
    ): Promise<CountResult> {
        const pipeline: PipelineStage[] = [];

        if (Object.keys(additionalFilters).length > 0) {
            pipeline.push({
                $match: additionalFilters,
            });
        }

        if (groupByField) {
            pipeline.push(
                {
                    $group: {
                        _id: `$${groupByField}`,
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        [groupByField]: '$_id',
                        count: 1,
                    },
                },
                {
                    $sort: { count: -1 },
                },
            );
        } else {
            pipeline.push({
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 },
                },
            });
        }

        const result = await this._repository.aggregate(pipeline);

        if (result.length === 0) {
            return groupByField ? [] : { totalCount: 0 };
        }

        if (!groupByField) {
            return { totalCount: result[0]?.totalCount || 0 };
        }

        return result.map(item => {
            if (item[groupByField] === null) {
                return {
                    [groupByField]: 'un-categorized',
                    count: item.count,
                };
            }
            return item;
        });
    }

    // Check if document exists
    async exists(
        filter: FilterQuery<Entity>,
        withDeleted?: boolean,
    ): Promise<boolean> {
        const count = await this.count(filter, withDeleted);
        return count > 0;
    }
}
