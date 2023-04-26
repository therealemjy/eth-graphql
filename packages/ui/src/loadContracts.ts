import { cosmiconfigSync } from "cosmiconfig";

const loadContracts = () => {
  // TODO: check contract config is valid
  try {
    const configFile = cosmiconfigSync("unnamed-library").search();

    if (!configFile?.config) {
      throw new Error("unnamed-library.config.js config file not found");
    }

    // TODO: check config is in the right format

    return configFile.config.default;
  } catch (error) {
    console.log("error", error);
    // TODO: throw human-friendly error
    throw new Error("unnamed-library.config.js config file not found");
  }
};

export default loadContracts;
