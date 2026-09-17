// Monorepo setup per Expo's own guide (https://docs.expo.dev/guides/monorepos/).
//
// Metro must see the workspace root so it can resolve shared packages
// (@finora/types, @finora/validation, @finora/utils) from ../../packages/*,
// but the pnpm workspace ALSO contains apps/client (Next.js), which pins a
// different React version (19.3.0) than this Expo SDK (19.1.0) — both are
// individually correct for their own framework, but Metro must never let
// its hierarchical node_modules search wander into apps/client's tree and
// pick up the wrong React/React Native copy. disableHierarchicalLookup +
// an explicit nodeModulesPaths list (this app's own node_modules, then the
// workspace root's) pins resolution to exactly those two locations.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
