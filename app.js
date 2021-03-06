require('newrelic');
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/index')
  , group1 = require('./routes/group1')
    , group2 = require('./routes/group2')
    , group3 = require('./routes/group3')
  , http = require('http')
  , path = require('path');
var mongo = require('mongodb');
var _ = require('underscore');

var app = express();
var collegeDB=null ;


mongo.MongoClient.connect( 'mongodb://localhost:27017/collegeDB', function (err, db) {
    if (err)  return console.dir(err)
    collegeDB=db
    app.configure(function(){
      app.set('port', process.env.PORT || 11027);
      app.set('views', __dirname + '/views');
      app.set('view engine', 'jade');
      app.use(express.favicon());
      app.use(express.logger('dev'));
      app.use(express.urlencoded());
      app.use(express.methodOverride());
      app.use(express.cookieParser('your secret here'));
      app.use(express.session());
      app.use(app.router);
      app.use(express.static(path.join(__dirname, 'public')));
    });


    app.configure('development', function(){
      app.use(express.errorHandler());
    });

    // app.get('/group1', routes.group1);
    //app.get('/', routes.index);


    app.get('/question1',group1.question1(collegeDB));
    app.get('/question2',group1.question2(collegeDB));
    app.get('/question3',group1.question3(collegeDB));
    app.get('/question4',group1.question4(collegeDB));
    app.get('/question5',group1.question5(collegeDB));

    app.get('/question6',group2.question6(collegeDB));
    app.get('/question7',group2.question7(collegeDB));
    app.get('/question8',group2.question8(collegeDB));
    app.get('/question9',group2.question9(collegeDB));

    app.get('/question10',group3.question10(collegeDB));
    app.get('/question12',group3.question12(collegeDB));
    app.get('/question11',group3.question11(collegeDB));

    http.createServer(app).listen(app.get('port'), function(){
      console.log("Express server listening on port " + app.get('port'));
    });

});

