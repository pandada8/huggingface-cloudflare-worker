addEventListener('fetch', event => {
  event.respondWith(fetchAndApply(event.request))
})

function serveIndex(url) {
  return 
}

async function fetchAndApply(request) {
  let url = new URL(request.url)
  if (request.method != 'GET' && request.method != 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  if (url.pathname == '/') {
    return new Response(`export HF_ENDPOINT=https://${url.host}\nhuggingface-cli download <your_favourite_model>`, {headers: {'content-type': 'text/plain'}})
  }
  const matched = url.pathname.match(/^\/___FIX_HEADER\/(.*.huggingface.co\/.*)/)
  if (matched) {
    const ret = new Request('https://' + matched[1] + url.search, {headers: request.headers, method: 'GET'})
    return fetch(ret)
  }
  const target = new URL("https://huggingface.co" + url.pathname)
  const req = new Request(target, {headers: request.headers, method: 'HEAD', redirect: 'manual'})
  const firstResponse = await fetch(req)
  console.log(firstResponse.status)
  if (firstResponse.status == 302) {
    const location = new URL(firstResponse.headers.get('location'))
    const newLocation = `https://${url.hostname}/___FIX_HEADER/${location.hostname}${location.pathname}${location.search}`
    let headers = {}
    for (const [key, value] of firstResponse.headers) {
      if (key != 'location' && key != 'access-control-allow-origin' ) {
        headers[key] = value
      }
    }
    headers['location'] = newLocation
    return new Response(null, {
      status: 302,
      headers: headers,
    })
  } else {
    return fetch(req, {
      method:'GET',
      redirect: 'manual',
    })
  }
}
