const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { camelCase } = require("camel-case");

// added caret here for all minor releases
const federatedRemotes = {
  "bn-mf-slider": "^1.0.0",
};

// add federated remotes to dependencies
const deps = {
  ...federatedRemotes,
  ...require("./package.json").dependencies,
};

/**
 * generate unpkg remote address
 *
 * @param {string} name library name
 * @returns {string} unpkg address
 */
const unpkgRemote = (name) =>
  `${camelCase(name)}@https://unpkg.com/${name}@${
    deps[name]
  }/dist/browser/remote-entry.js`;

const remotes = Object.keys(federatedRemotes).reduce(
  (remotes, lib) => ({
    ...remotes,
    [lib]: unpkgRemote(lib),
  }),
  {}
);

console.log("using remotes: ", remotes);

module.exports = {
  output: {
    publicPath: "http://localhost:8080/",
  },

  resolve: {
    extensions: [".jsx", ".js", ".json"],
  },

  devServer: {
    port: 8080,
    historyApiFallback: true,
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

  plugins: [
    new ModuleFederationPlugin({
      remotes,
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
      },
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
    }),
  ],
};
