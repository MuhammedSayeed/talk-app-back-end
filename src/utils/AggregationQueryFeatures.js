import { BaseQueryFeatures } from "./BaseQueryFeatures.js";

class AggregationQueryFeatures extends BaseQueryFeatures {
    constructor(model, queryString) {
        super(null, queryString);
        this.model = model;
        this.pipeline = [];
    }
    // match stage
    match(conditions) {
        this.pipeline.push({ $match: conditions });
        return this;
    }
    //lookup stage
    lookup(options) {
        this.pipeline.push({
            $lookup: {
                from: options.from,
                localField: options.localField,
                foreignField: options.foreignField,
                as: options.as,
                pipeline: options.pipeline || []
            }
        })

        return this;
    }
    // unwind stage
    unwind(options) {
        this.pipeline.push({
            $unwind: {
                path: options.path,
                preserveNullAndEmptyArrays: options.preserveNullAndEmptyArrays || false
            }
        });
        return this;
    }
    // project stage
    project(projection) {
        this.pipeline.push({ $project: projection });
        return this;
    }
    addFields(fields) {
        this.pipeline.push({ $addFields: fields });
        return this;
    }
    // sort stage
    sort(options) {
        this.pipeline.push({ $sort: options });
        return this;
    }
    // group stage
    group(options) {
        this.pipeline.push({ $group: options });
        return this;
    }
    // pagination stage
    paginate() {
        const page = this.getPage();
        const limit = this.getLimit();
        const skip = (page - 1) * limit;
        this._skip = skip;
        this._limit = limit;

        return this;
    }
    buildCountPipeline() {
        return this.pipeline.filter(
            stage => !('$skip' in stage || '$limit' in stage)
        );
    }
    async getTotalDocs() {
        const countPipeline = [...this.buildCountPipeline(), { $count: "totalDocs" }];
        const result = await this.model.aggregate(countPipeline);
        return result[0]?.totalDocs || 0;
    }
    applyPaginationStages() {
        if (typeof this._skip === "number" && typeof this._limit === "number") {
            this.pipeline.push(
                { $skip: this._skip },
                { $limit: this._limit }
            );
        }
    }
    async executeFinalPipeline() {
        return await this.model.aggregate(this.pipeline);
    }
    // Execute the aggregation pipeline
    async execute() {
        const totalDocs = await this.getTotalDocs();
        this.calculateMetadata(totalDocs);
        this.applyPaginationStages();
        const data = await this.executeFinalPipeline();
        return {
            metadata: this.metadata,
            data
        };
    }
}

export { AggregationQueryFeatures };