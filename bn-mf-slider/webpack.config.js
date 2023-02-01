const path = require("path");
const { camelCase } = require("camel-case");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const EnvironmentPlugin = require("webpack/lib/EnvironmentPlugin");

// extract dependencies and name from package.json
const pkg = require("./package.json");
const name = camelCase(pkg.name);
const deps = pkg.dependencies;

// The modules you want to expose
const exposes = {
  "./slider": "./src/slider.jsx",
};

// shared dependencies
const shared = {
  ...deps,
  react: {
    singleton: true,
    requiredVersion: deps.react,
  },
};

/** @type {webpack.Configuration} */
const devConfig = {
  mode: "development",
  output: {
    publicPath: "http://localhost:8081/",
  },

  devServer: {
    port: 8081,
    historyApiFallback: true,
  },

  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
    }),
    new EnvironmentPlugin({
      NODE_ENV: "development",
      DEBUG: false,
    }),
  ],
};

/** @type {webpack.Configuration} */
const baseConfig = {
  mode: process.env.NODE_ENV === "development" ? "development" : "production",
  resolve: {
    extensions: [".jsx", ".js", ".json"],
  },

  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.json$/,
        loader: "json-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};

/** @type {webpack.Configuration} */
const browserConfig = {
  output: {
    path: path.resolve("./dist/browser"),
  },
  plugins: [
    new ModuleFederationPlugin({
      name,
      filename: "remote-entry.js",
      exposes,
      shared,
    }),
  ],
};

/** @type {webpack.Configuration} */
const nodeConfig = {
  target: "node",
  output: {
    path: path.resolve("./dist/node"),
  },
  plugins: [
    new ModuleFederationPlugin({
      name,
      filename: "remote-entry.js",
      library: { type: "commonjs" },
      exposes,
      shared,
    }),
  ],
};

module.exports = (env, argv) => {
  if (argv.mode === "development") {
    return merge(baseConfig, devConfig);
  }

  return [merge(baseConfig, browserConfig), merge(baseConfig, nodeConfig)];
};
