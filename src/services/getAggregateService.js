import mongoose from "mongoose";
import { ApiFeatures } from "../utils/apiFeatures.js";


export const getAggregateService = async (userId, query, model, buildPipelineFn ) => {
  const loggedInUser = new mongoose.Types.ObjectId(userId);
  const features = ApiFeatures.create(model, query, "aggregate");
  const pipeline = buildPipelineFn(loggedInUser, query.search);
  features.pipeline = pipeline;
  features.paginate();
  return await features.execute();
};