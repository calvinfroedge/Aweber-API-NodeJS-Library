module.exports = {
  v1: {
    get_signature: function(method, url, params, consumer_secret, token_secret, algo) {
      var crypto, data, e, encodedParams, hash, key, paramString, sorted, text;
      if (token_secret == null) {
        token_secret = "";
      }
      if (algo == null) {
        algo = "base64";
      }
      e = encodeURIComponent;
      sorted = Object.keys(params).sort();
      encodedParams = [];
      sorted.map(function(s) {
        return encodedParams.push([s, '=', e(params[s])].join(''));
      });
      paramString = e(encodedParams.join('&'));
      data = [method, e(url), paramString].join('&');
      key = [e(consumer_secret), e(token_secret)].join('&');
      crypto = require('crypto');
      text = data;
      key = key;
      hash = crypto.createHmac('sha1', key).update(text).digest(algo);
      return hash;
    },
    nonce: function(len) {
      var s, val;
      s = "";
      while (s.length < len) {
        val = Math.floor(Math.random() * 2);
        if (val === 0) {
          s += String(Math.floor(Math.random() * 10));
        } else {
          s += String.fromCharCode(97 + Math.floor(Math.random() * 26));
        }
      }
      return s;
    }
  }
};
