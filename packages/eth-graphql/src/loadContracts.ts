import { cosmiconfigSync } from "cosmiconfig";

const loadContracts = () => {
  // TODO: check contract config is valid
  try {
    const configFile = cosmiconfigSync("eth-graphql").search();

    if (!configFile?.config) {
      throw new Error("eth-graphql.config.js config file not found");
    }

    // TODO: check config is in the right format

    return configFile.config.default;
  } catch (error) {
    console.log("error", error);
    // TODO: throw human-friendly error
    throw new Error("eth-graphql.config.js config file not found");
  }
};

export default loadContracts;
