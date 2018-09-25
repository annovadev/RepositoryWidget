const webpack = require('webpack');
var fs = require('fs')
var path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
var BundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var nodeExternals = require('webpack-node-externals');
var isProduction = process.env.NODE_ENV === 'production';
var isDevelopment = process.env.NODE_ENV === 'development';

const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');




const configPlugin = {

  target: "web",
  resolve: {
    // Make sure, Webpack finds import'ed and require'd files specified without extension
    // so 'import Bla from './Bla' makes webpack to look for files 'Bla', 'Bla.js' and 'Bla.jsx'
    extensions: [ '.js', '.jsx']
  },

  entry: {
  
    'app': [
      'babel-polyfill',
      'react-hot-loader/patch'      
    ],
    'config' : './src/config/index',


   
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: '[name].js'    
  },
  module: {
       rules: [
      { test: /\.js$/,  
        exclude: path.resolve(__dirname, "node_modules"),
        loader: 'babel-loader'
      
      }
      
    
    ],
    loaders: [
      // JSX/ES6 handling with babel
        // * babel-loader: uses Babel to transform your JSX/ES6 JavaScript to ECMAScript 5
        // * react-hot: Reloads your React Component on code changes without loosing the application state
    //	{	test: /\.js$/, exclude: /node_modules/, loaders: ['react-hot', 'babel-loader?optional[]=es7.functionBind']},
    //		{	test: /\.jsx$/, exclude: /node_modules/, loaders: ['react-hot', 'babel-loader?optional[]=es7.functionBind']},
        // CSS handling
        // * style-loader: Embeds referenced CSS code using a <style>-element in your index.html file
        // * css-loader: Parses the actual CSS files referenced from your code. Modifies url()-statements in your
        //   CSS files to match images handled by url loader (see below)
      //	{ test: /\.js$/, loader: 'babel', query: { presets: ['react', 'es2015'] },
        { test: /\.css$/, loader: 'style!css' },
  
        // Image Handling
        // * url-loader: Returns all referenced png/jpg files up to the specified limit as inline Data Url
        //   or - if above that limit - copies the file to your output directory and returns the url to that copied file
        //   Both values can be used for example for the 'src' attribute on an <img> element
        {	test: /\.(png|jpg)$/,	loader: 'url?limit=25000'	},
  
        // JSon file handling
        // * Enables you to 'require'/'import' json files from your JS files
     //   {	test: /\.json$/, loader: 'json-loader' },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015'],
          }
        },
       { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
      
       {
         test: /\.config$/,
         loader: "file-loader",
         options: {
           name: "[name].[ext]"
         }
       
      }
      ]
    
   
  },

  externals: {
//    fs:    "commonjs fs",
//    path:  "commonjs path",

   "react": "React",
   "react-dom": "ReactDOM",
   "lodash": "_",
   'semantic-ui-react': 'semanticUIReact',

  },
 
  plugins: [
   
		new HtmlWebpackPlugin({  // Also generate a test.html
      filename: 'config.html',
      template: './src/config/index.dev.html'
    }),
    new CopyWebpackPlugin([
          
      // Copy OMWebPluginLib / Client-side SDK libs contents to {output}/
      { from: './src/lib/OMWebPluginLib', to: './lib/OMWebPluginLib' },
      { from: './src/lib/babel', to: './lib/babel' },
      { from: './src/lib/lodash', to: './lib/lodash' },           
      { from: './src/lib/react', to: './lib/react' },
      { from: './src/lib/semantic-ui', to: './lib/semantic-ui' },
      { from: './src/lib/timeago', to: './lib/timeago' },
      { from: './src/settings.json' },
  //    { from: './src/web.config' }
])
 /*   new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor-bundle1',
      chunks: ['bundle1'],
      filename: 'vendor-bundle1.js',
      minChunks: Infinity
    }),*/
//    new BundleAnalyzer()
  ],
  
  
  devServer: {
    host: "0.0.0.0",
    index: "config.html",
    port: 3001,
    hot: true,
    inline: true,

  }
}


module.exports = [configPlugin];