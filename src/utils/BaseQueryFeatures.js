class BaseQueryFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
        this.metadata = {
            page: 1,
            limit: 10,
            totalDocs: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
        };
    }

    #isValidNumber(number) {
        return Number.isInteger(number) && number > 0;
    }
    // Get page number from query string
    getPage() {
        const page = parseInt(this.queryString.page);
        return this.#isValidNumber(page) ? page : 1;
    }
    // Get limit number from query string
    getLimit() {
        const limit = parseInt(this.queryString.limit);
        return this.#isValidNumber(limit) && (limit <= 20) ? limit : 10;
    }
    // Calculate and update metadata
    calculateMetadata(totalDocs) {
        const page = this.getPage();
        const limit = this.getLimit();
        const totalPages = Math.ceil(totalDocs / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        this.metadata = {
            page,
            limit,
            totalDocs,
            totalPages,
            hasNextPage,
            hasPrevPage
        }

        return this.metadata;
    }
    // Execute query
    async execute() {
        return this.query;
    }
}

export {
    BaseQueryFeatures
}