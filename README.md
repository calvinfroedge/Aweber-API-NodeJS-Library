#Integrate AWeber with Your NodeJS Application

This library was created to provide Oauth and API request functionality between NodeJS applications and the Aweber API.

You'll also find a complete, working sample application running express in example.js. Install express using `npm`, I intentionally left it out of the project dependencies.

## Step 1 - Create App, Get Credentials

- Go to [AWeber Labs](https://labs.aweber.com/) and get a free development account.
- Create an app, and retrieve your consumer key and consumer secret.

## Step 2 - Do OAuth

I didn't find the node OAuth libraries to be useful. I only needed the request signing and parameter encoding, so I implemented just that. Here's how to perform each piece of the process.

### Decide on a callback URL

This is the URL Aweber will send the user back to during each step of the process.

### Getting a request token

```
var NodeAweber = require('node-aweber');

var NA = new NodeAweber(CONSUMER_KEY, CONSUMER_SECRET, CALLBACK_URL);

NA.requestToken(callback);
```

Note that all variables for this request will be generated automatically. This will give you an `oauth_token` and `oauth_token_secret` you'll need in the next steps.

### Authorizing request token

After getting the request token, authorizing it is as simple as redirecting the user to this URL:

```
https://auth.aweber.com/1.0/oauth/authorize?oauth_token=OAUTH_TOKEN_FROM_CALLBACK
```

### Getting an access token

After the user enters their details, they'll be redirected to your application, this time via a GET request with the following query params:

- `oauth_verifier`
- `oauth_token`

Now, generate the access token:

```
var accessToken = NA.accessToken(oauth_token, oauth_verifier, token_secret_from_earlier, callback);
```

...And you'll now have an `oauth_token_secret` and `oauth_token` you can use for further requests!

## Step 3 - Make API calls

```
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
```
