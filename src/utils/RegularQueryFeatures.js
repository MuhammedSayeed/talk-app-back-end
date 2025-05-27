import { BaseQueryFeatures } from "./BaseQueryFeatures.js";

class RegularQueryFeatures extends BaseQueryFeatures {
    constructor(query, queryString) {
        super(query, queryString);
    }

    paginate() {
        const page = this.getPage();
        const limit = this.getLimit();
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit);
        return this;
    }

    filter() {
        // Create a copy of query parameters
        const filterObj = { ...this.queryString };

        // Remove special query parameters that aren't filters
        const excludedFields = ['sort', 'page', 'limit', 'fields', 'search'];
        excludedFields.forEach(field => delete filterObj[field]);

        // Handle MongoDB operators ($gt, $gte, etc.)
        let filterStr = JSON.stringify(filterObj);
        filterStr = filterStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        const finalFilter = JSON.parse(filterStr);

        // Apply filters to the query
        this.query.find(finalFilter);
        this._rawFilter = finalFilter;
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query.sort(sortBy);
        } else {
            this.query.sort('-createdAt');
        }
        return this;
    }

    search() {
        if (this.queryString.search) {
            const searchQuery = this.queryString.search;
            const keywordFilter = {
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { username: { $regex: searchQuery, $options: 'i' } }
                ]
            };
            this.query.find(keywordFilter);
            this._rawFilter = { ...this._rawFilter, ...keywordFilter };
        }
        return this;
    }

    async execute() {
        const count = await this.query.model.countDocuments(this._rawFilter || {});

        this.calculateMetadata(count);

        const data = await this.query.exec();

        return {
            data,
            metadata: this.metadata
        }
    }

}

export { RegularQueryFeatures };