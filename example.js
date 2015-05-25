var express = require('express');
var app = express();

var NodeAweber = require('./index');
var NA = new NodeAweber(process.env.consumer_key, process.env.consumer_secret, 'http://localhost:3000/callback');

//In a real app, you'd store this in the user's session or via a websocket client, or something. This is just a global variable, and won't scale past a single user.
var token, tokenSecret;

app.get('/', function(req, res){
  var requestToken = NA.requestToken(function(err, response){
    tokenSecret = response.oauth_token_secret;
    res.redirect('https://auth.aweber.com/1.0/oauth/authorize?oauth_token='+response.oauth_token);
  });
});

app.get('/callback', function (req, res) {
  var q = req.query;
  
  if(q.oauth_token && q.oauth_verifier){
    var accessToken = NA.accessToken(q.oauth_token, q.oauth_verifier, tokenSecret, function(err, response){
      token = response.oauth_token;
      tokenSecret = response.oauth_token_secret;
      res.send(JSON.stringify(response)+'<br /><a href="/api_sample">Make an api request (get lists)</a>');
    });
  }
});

app.get('/api_sample', function(req, res){
  var apiClient = NA.api(token, tokenSecret);

  apiClient.request('get', 'accounts', {}, function(err, response){
    var accounts = response.entries;
    var listsUrl = 'accounts/'+accounts[0].id+'/lists';
    apiClient.request('get', listsUrl, {}, function(err, response){
      apiClient.request('post', listsUrl+'/'+response.entries[0].id+'/subscribers', {
        'ws.op': 'create',
        'email': 'justatestemail000000zzz@gmail.com'
      }, function(err, response){
        if(response.status == 201){
          res.send('subscriber added to list.');
        } else {
          res.send(JSON.stringify(response)); 
        }
      });
    });
  });
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
