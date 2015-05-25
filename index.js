module.exports = function(consumerKey, consumerSecret, callbackURL){
  var oauth = require('./src/oauth');
  var unirest = require('unirest');
  var qs = require('querystring');

  var commonParams = function(){
    return {
      oauth_consumer_key: consumerKey,
      oauth_nonce: oauth.v1.nonce(32),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: (new Date()).getTime(),
      oauth_version: '1.0'
    }
  }

  var putOrPost = function(type, url, params, callback){
    unirest.post(url).send(params).end(function(response){
      if(!response.ok){
        callback(response.body);
      } else {
        callback(null, response.body);
      }
    });
  }

  var tokenSecret = null;

  return {
    /*
     * Returns oauth_token_secret and oauth_token via callback on success
     *
     * Example: requestToken(function(err, response){
     *  var token = response.oauth_token;
     *  var tokenSecret = response.oauth_token_secret;
     * });
     */
    requestToken: function(callback){
      var url = 'https://auth.aweber.com/1.0/oauth/request_token';
      var params = commonParams();
      
      params.oauth_callback = callbackURL;
      params.oauth_token = '';
      params.oauth_signature = oauth.v1.get_signature('POST', url, params, consumerSecret);

      putOrPost('post', url, params, callback);
    },

    /*
     * Returns oauth_token_secret and oauth_token via callback on success
     *
     * Example: accessToken(oauthToken, oauthVerifier, function(err, response){
     *  var token = response.oauth_token;
     *  var tokenSecret = response.oauth_token_secret;
     * });
     */
    accessToken: function(oauthToken, oauthVerifier, tokenSecret, callback){
      var url = 'https://auth.aweber.com/1.0/oauth/access_token';
      var params = commonParams();

      params.oauth_token = oauthToken;
      params.oauth_verifier = oauthVerifier;
      params.oauth_signature = oauth.v1.get_signature('POST', url, params, consumerSecret, tokenSecret);

      putOrPost('post', url, params, callback);
    },

    /*
     * Return an API client to start running queries
     */
    api: function(token, tokenSecret){
      return {
        /*
         * Generic Aweber API request, such as adding a subscriber to a list:
         *
         * request('post', 'accounts/1/lists/LIST_ID/subscribers', data, callback)
         */
        request: function(type, endpoint, params, cb){
          var type = type.toLowerCase();
          var url = 'https://api.aweber.com/1.0/'+endpoint;

          common = commonParams();
          for(var k in common){
            params[k] = common[k];
          }

          params.oauth_token = token;
          params.oauth_signature = oauth.v1.get_signature(type.toUpperCase(), url, params, consumerSecret, tokenSecret);

          if(type == 'get' || type == 'delete'){
            unirest[type](url+'?'+qs.stringify(params)).end(function(response){
              if(!response.ok){
                cb(response.body);
              } else {
                cb(null, response.body);
              }
            });
          }

          if(type == 'put' || type == 'post'){
            putOrPost(type, url, params, cb);
          }
        }
      }
    }
  }
}
