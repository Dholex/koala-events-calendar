module.exports = {
  entry: [
    'script!jquery/dist/jquery.min.js',
    'script!jquery-ui-dist/jquery-ui.min.js',
    'script!moment/min/moment.min.js',
    'script!fullcalendar/dist/fullcalendar.min.js',
    './app/app.jsx'
  ],
  output: {
    path: __dirname,
    filename: './public/bundle.js'
  },
  resolve: {
    root: __dirname,
    alias: {
      applicaitonStyles: 'app/styles/app.scss'
    },
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-0']
        },
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/
      },
      {loaders: ['style', 'css', 'sass'], test: /\.scss$/ }
    ]
  },
  devtool: 'cheap-module-source-map'
};
