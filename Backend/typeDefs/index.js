import userTypeDefs from "./user.typeDefs.js";
import transactionTypeDefs from "./transaction.typeDefs.js";

import { mergeTypeDefs } from "@graphql-tools/merge";

const mergedTypeDefs = mergeTypeDefs([userTypeDefs, transactionTypeDefs]);

export default mergedTypeDefs;