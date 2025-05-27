
import { AggregationQueryFeatures } from "./AggregationQueryFeatures.js";
import { RegularQueryFeatures } from "./RegularQueryFeatures.js";



class ApiFeatures {
    /**
     * Create the appropriate query features based on input
     * @param {Object} query - Mongoose query or model for aggregation
     * @param {Object} queryString - Express request query object
     * @param {String} type - 'regular' or 'aggregate'
     */

    static create(query, queryString, type = 'regular') {
        if (type === 'aggregate') {
            return new AggregationQueryFeatures(query, queryString);
        }
        return new RegularQueryFeatures(query, queryString);
    }
}

export {
    ApiFeatures
}