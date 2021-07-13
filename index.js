
var http = require('http'),
  url = require('url');

const port = process.env.PORT || 4000;

http.createServer(function(request, response) {
  target = request.url;

  if(target[0] == "/") // remove the leading forward slash
    target = target.substring(1, target.length);

  console.log("Request received. Target: " + target);

  // parse the url
  url_parts = url.parse(target);
  if(url_parts.host == undefined) { // stop processing, URL must contain http(s)://
    response.write("ERROR: missing host in target URL " + target);
    response.end();
  }
  else {

    var proxy = http.createClient(80, url_parts.host)
    var proxy_request = proxy.request(request.method, url_parts.href, request.headers);
    
    console.log("Creating proxy request to server: " + url_parts.hostname + ", path: " + url_parts.pathname);
    proxy_request.addListener('response', function (proxy_response) {
      proxy_response.addListener('data', function(chunk) {
        response.write(chunk, 'binary');
      });
      proxy_response.addListener('end', function() {
        response.end();
      });
      response.writeHead(proxy_response.statusCode, proxy_response.headers);
    });
    request.addListener('data', function(chunk) {
      proxy_request.write(chunk, 'binary');
    });
    request.addListener('end', function() {
      proxy_request.end();
    });
  }
}).listen(port);
console.log("Proxy started. Listening to port" + port);